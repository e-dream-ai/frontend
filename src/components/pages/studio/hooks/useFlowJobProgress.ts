import { useEffect, useCallback, useMemo, useRef } from "react";
import Bugsnag from "@bugsnag/js";
import { useFlowStore } from "@/stores/flow.store";
import { useSocket } from "@/hooks/useSocket";
import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";
import {
  JOB_PROGRESS_EVENT,
  JOIN_DREAM_ROOM_EVENT,
  LEAVE_DREAM_ROOM_EVENT,
} from "@/constants/remote-control.constants";

const POLL_INTERVAL_MS = 10_000;

// Maps backend status strings to TransitionStatus
function mapStatus(
  backendStatus: string,
): "queue" | "processing" | "processed" | "failed" | null {
  switch (backendStatus?.toUpperCase?.()) {
    case "IN_QUEUE":
    case "QUEUE":
      return "queue";
    case "IN_PROGRESS":
    case "PROCESSING":
      return "processing";
    case "COMPLETED":
    case "PROCESSED":
      return "processed";
    case "FAILED":
    case "TIMED_OUT":
    case "CANCELLED":
      return "failed";
    default:
      return null;
  }
}

export function useFlowJobProgress() {
  const { socket } = useSocket();

  const transitions = useFlowStore((s) => s.transitions);
  const updateTransitionStatus = useFlowStore((s) => s.updateTransitionStatus);

  // Collect pending entries, UUIDs, and lookup map in one pass
  const { pendingEntries, pendingUuids, uuidMap } = useMemo(() => {
    const entries: Array<{ uuid: string; index: number; isUprez: boolean }> =
      [];
    transitions.forEach((t, i) => {
      if (t.dreamUuid && (t.status === "queue" || t.status === "processing")) {
        entries.push({ uuid: t.dreamUuid, index: i, isUprez: false });
      }
      if (
        t.uprezDreamUuid &&
        (t.uprezStatus === "queue" || t.uprezStatus === "processing")
      ) {
        entries.push({ uuid: t.uprezDreamUuid, index: i, isUprez: true });
      }
    });
    const uuids = entries.map((e) => e.uuid);
    const map = new Map(
      entries.map((e) => [e.uuid, { index: e.index, isUprez: e.isUprez }]),
    );
    return { pendingEntries: entries, pendingUuids: uuids, uuidMap: map };
  }, [transitions]);

  // Handle job:progress events
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

      const mappedStatus = mapStatus(data.status ?? "");
      if (!mappedStatus) return;

      if (entry.isUprez) {
        useFlowStore
          .getState()
          .updateTransitionUprezStatus(
            entry.index,
            mappedStatus,
            data.progress,
          );
      } else {
        updateTransitionStatus(entry.index, mappedStatus, data.progress);
      }
    },
    [uuidMap, updateTransitionStatus],
  );

  // Register Socket.IO event listener
  useEffect(() => {
    if (!socket) return;
    socket.on(JOB_PROGRESS_EVENT, handleProgress);
    return () => {
      socket.off(JOB_PROGRESS_EVENT, handleProgress);
    };
  }, [socket, handleProgress]);

  // Join/leave Socket.IO rooms — diff against previous set to avoid churn
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

  // Rejoin all known rooms on reconnect, and leave them all on unmount or
  // socket swap. Keyed on [socket] so neither runs when the pending set changes.
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

  // Keep a ref to pendingEntries so the polling interval doesn't restart on every status update
  const pendingEntriesRef = useRef(pendingEntries);
  pendingEntriesRef.current = pendingEntries;

  // Polling fallback — deps only on pendingUuids.length so the interval stays stable
  useEffect(() => {
    if (pendingUuids.length === 0) return;

    const poll = async () => {
      const entries = pendingEntriesRef.current;
      const headers = getRequestHeaders({
        contentType: ContentType.json,
      });
      for (const entry of entries) {
        try {
          const { data } = await axiosClient.get(`/v1/dream/${entry.uuid}`, {
            headers,
          });
          const dream = data?.data?.dream;
          if (!dream) continue;

          const mappedStatus = mapStatus(dream.status);
          if (!mappedStatus) continue;

          if (entry.isUprez) {
            useFlowStore
              .getState()
              .updateTransitionUprezStatus(entry.index, mappedStatus);
          } else {
            useFlowStore
              .getState()
              .updateTransitionStatus(entry.index, mappedStatus);
          }
        } catch (err) {
          // Polling failure is non-fatal — Socket.IO is primary.
          Bugsnag.notify(err as Error);
        }
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pendingUuids.length]);
}
