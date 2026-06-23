import { useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { useFlowStore } from "@/stores/flow.store";
import { useSessionStore } from "@/stores/session.store";
import { useSocket } from "@/hooks/useSocket";
import { fetchDream } from "@/api/dream/query/useDream";
import {
  JOB_PROGRESS_EVENT,
  JOIN_DREAM_ROOM_EVENT,
  LEAVE_DREAM_ROOM_EVENT,
} from "@/constants/remote-control.constants";
import {
  mapSocketStatus,
  shouldApplyStatus,
  isPendingStatus,
} from "./mapSocketStatus";

export function useFlowJobProgress() {
  const { socket, isConnected } = useSocket();

  const transitions = useFlowStore((s) => s.transitions);
  const updateTransitionStatus = useFlowStore((s) => s.updateTransitionStatus);

  const toastedFailuresRef = useRef<Set<string>>(new Set());
  const toastFailure = useCallback((uuid: string, error?: string | null) => {
    if (toastedFailuresRef.current.has(uuid)) return;
    toastedFailuresRef.current.add(uuid);
    if (error) toast.error(error);
  }, []);

  const { pendingEntries, pendingUuids, uuidMap } = useMemo(() => {
    const entries: Array<{ uuid: string; index: number; isUprez: boolean }> =
      [];
    transitions.forEach((t, i) => {
      if (t.dreamUuid && isPendingStatus(t.status)) {
        entries.push({ uuid: t.dreamUuid, index: i, isUprez: false });
      }
      if (t.uprezDreamUuid && isPendingStatus(t.uprezStatus)) {
        entries.push({ uuid: t.uprezDreamUuid, index: i, isUprez: true });
      }
    });
    const uuids = entries.map((e) => e.uuid);
    const map = new Map(
      entries.map((e) => [e.uuid, { index: e.index, isUprez: e.isUprez }]),
    );
    return { pendingEntries: entries, pendingUuids: uuids, uuidMap: map };
  }, [transitions]);

  const handleProgress = useCallback(
    (data: {
      dreamUuid?: string;
      dream_uuid?: string;
      status?: string;
      progress?: number;
    }) => {
      const uuid = data.dreamUuid || data.dream_uuid;
      if (!uuid) return;

      const entry = uuidMap.get(uuid);
      if (!entry) return;

      const transition = useFlowStore.getState().transitions[entry.index];
      if (!transition) return;

      const current = entry.isUprez
        ? transition.uprezStatus
        : transition.status;
      const mappedStatus = mapSocketStatus(data.status);

      const currentTracked =
        current === "queue" || current === "processing" ? current : undefined;
      const nextStatus = shouldApplyStatus(current, mappedStatus)
        ? mappedStatus
        : currentTracked;

      if (!nextStatus) return;

      if (entry.isUprez) {
        useFlowStore
          .getState()
          .updateTransitionUprezStatus(entry.index, nextStatus, data.progress);
      } else {
        updateTransitionStatus(entry.index, nextStatus, data.progress);
      }

      if (nextStatus === "failed") {
        fetchDream(uuid)
          .then((dream) => toastFailure(uuid, dream?.error))
          .catch(() => {});
      }
    },
    [uuidMap, updateTransitionStatus, toastFailure],
  );

  useEffect(() => {
    if (!socket) return;
    socket.on(JOB_PROGRESS_EVENT, handleProgress);
    return () => {
      socket.off(JOB_PROGRESS_EVENT, handleProgress);
    };
  }, [socket, handleProgress]);

  const joinedUuidsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!socket) return;

    const currentSet = new Set(pendingUuids);
    const prevSet = joinedUuidsRef.current;

    for (const uuid of currentSet) {
      if (!prevSet.has(uuid)) socket.emit(JOIN_DREAM_ROOM_EVENT, uuid);
    }
    for (const uuid of prevSet) {
      if (!currentSet.has(uuid)) socket.emit(LEAVE_DREAM_ROOM_EVENT, uuid);
    }
    joinedUuidsRef.current = currentSet;
  }, [socket, pendingUuids]);

  useEffect(() => {
    if (!socket) return;
    const rejoinAll = () => {
      joinedUuidsRef.current.forEach((uuid) =>
        socket.emit(JOIN_DREAM_ROOM_EVENT, uuid),
      );
    };
    socket.on("connect", rejoinAll);
    return () => {
      socket.off("connect", rejoinAll);
      joinedUuidsRef.current.forEach((uuid) =>
        socket.emit(LEAVE_DREAM_ROOM_EVENT, uuid),
      );
      joinedUuidsRef.current = new Set();
    };
  }, [socket]);

  const pendingEntriesRef = useRef(pendingEntries);
  pendingEntriesRef.current = pendingEntries;

  const activeSessionId = useSessionStore((s) => s.activeSessionId);

  useEffect(() => {
    if (pendingUuids.length === 0) return;

    for (const entry of pendingEntriesRef.current) {
      fetchDream(entry.uuid)
        .then((dream) => {
          if (!dream) return;

          const mappedStatus = mapSocketStatus(dream.status);
          if (!mappedStatus) return;

          if (mappedStatus === "failed") toastFailure(entry.uuid, dream.error);

          const transition = useFlowStore.getState().transitions[entry.index];
          const current = entry.isUprez
            ? transition?.uprezStatus
            : transition?.status;
          if (!shouldApplyStatus(current, mappedStatus)) return;

          if (entry.isUprez) {
            useFlowStore
              .getState()
              .updateTransitionUprezStatus(entry.index, mappedStatus);
          } else {
            useFlowStore
              .getState()
              .updateTransitionStatus(entry.index, mappedStatus);
          }
        })
        .catch(() => {});
    }
  }, [pendingUuids.length, activeSessionId, isConnected, toastFailure]);
}
