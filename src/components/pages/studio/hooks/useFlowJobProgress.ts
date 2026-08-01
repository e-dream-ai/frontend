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
import { findTransitionIndexByDream } from "../utils/flow-progress.util";

// How often to re-check pending transition dreams as a fallback for missed
// socket events. Fast enough to feel live, slow enough to avoid hammering.
const RECONCILE_POLL_MS = 5000;

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

  // Fallback reconciliation. A generated transition only advances
  // queue -> processing -> processed via live socket `job:progress` events. If a
  // completion event is ever missed — the dream room is joined after the worker
  // already emitted, a reconnect gap, a dropped event — the edge would otherwise
  // stay stuck at queue/processing until a full page reload. So while anything
  // is pending, poll the backend on an interval and apply the real status. This
  // self-heals within a session (issue #696).
  useEffect(() => {
    if (pendingUuids.length === 0) return;

    let cancelled = false;

    const reconcileOnce = () => {
      for (const entry of pendingEntriesRef.current) {
        fetchDream(entry.uuid)
          .then((dream) => {
            if (cancelled || !dream) return;

            const mappedStatus = mapSocketStatus(dream.status);
            if (!mappedStatus) return;

            if (mappedStatus === "failed")
              toastFailure(entry.uuid, dream.error);

            // Re-resolve the transition by dream UUID (not the captured index):
            // a reorder/insert can shift positions, and routing the update by
            // index would land it on the wrong edge.
            const { transitions: current } = useFlowStore.getState();
            const idx = findTransitionIndexByDream(
              current,
              entry.uuid,
              entry.isUprez,
            );
            if (idx === -1) return;

            const currentStatus = entry.isUprez
              ? current[idx].uprezStatus
              : current[idx].status;
            if (!shouldApplyStatus(currentStatus, mappedStatus)) return;

            if (entry.isUprez) {
              useFlowStore
                .getState()
                .updateTransitionUprezStatus(idx, mappedStatus);
            } else {
              useFlowStore.getState().updateTransitionStatus(idx, mappedStatus);
            }
          })
          .catch(() => {});
      }
    };

    reconcileOnce();
    const timer = setInterval(reconcileOnce, RECONCILE_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pendingUuids.length, activeSessionId, isConnected, toastFailure]);
}
