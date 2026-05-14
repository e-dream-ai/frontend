import { useEffect, useCallback, useMemo } from "react";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
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

  const { transitions, updateTransitionStatus } = useFlowStore(
    useShallow((s) => ({
      transitions: s.transitions,
      updateTransitionStatus: s.updateTransitionStatus,
    })),
  );

  // Collect pending dream UUIDs with their transition indices
  const pendingEntries = useMemo(() => {
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
        entries.push({
          uuid: t.uprezDreamUuid,
          index: i,
          isUprez: true,
        });
      }
    });
    return entries;
  }, [transitions]);

  const pendingUuids = useMemo(
    () => pendingEntries.map((e) => e.uuid),
    [pendingEntries],
  );

  // Build UUID → { index, isUprez } lookup
  const uuidMap = useMemo(() => {
    const map = new Map<string, { index: number; isUprez: boolean }>();
    for (const e of pendingEntries) {
      map.set(e.uuid, { index: e.index, isUprez: e.isUprez });
    }
    return map;
  }, [pendingEntries]);

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

  // Join/leave Socket.IO rooms for pending UUIDs
  useEffect(() => {
    if (!socket || pendingUuids.length === 0) return;

    const joinRooms = () => {
      pendingUuids.forEach((uuid) => socket.emit(JOIN_DREAM_ROOM_EVENT, uuid));
    };

    joinRooms();
    socket.on("connect", joinRooms);

    return () => {
      socket.off("connect", joinRooms);
      pendingUuids.forEach((uuid) => socket.emit(LEAVE_DREAM_ROOM_EVENT, uuid));
    };
  }, [socket, pendingUuids]);

  // Polling fallback
  useEffect(() => {
    if (pendingUuids.length === 0) return;

    const poll = async () => {
      const headers = getRequestHeaders({
        contentType: ContentType.json,
      });
      for (const entry of pendingEntries) {
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
            updateTransitionStatus(entry.index, mappedStatus);
          }
        } catch {
          // Polling failure is non-fatal — Socket.IO is primary
        }
      }
    };

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pendingEntries, pendingUuids.length, updateTransitionStatus]);
}
