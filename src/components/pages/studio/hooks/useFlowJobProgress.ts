import type { ApiResponse } from "@/types/api.types";
import { useDreamRooms } from "@/hooks/useDreamRooms";
import { useEffect, useCallback, useMemo, useRef } from "react";
import { useQueries, type QueryFunctionContext } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useFlowStore } from "@/stores/flow.store";
import { useSocket } from "@/hooks/useSocket";
import {
  DREAM_QUERY_KEY,
  fetchDream,
  getDreamResponse,
} from "@/api/dream/query/useDream";
import type { Dream } from "@/types/dream.types";
import { JOB_PROGRESS_EVENT } from "@/constants/remote-control.constants";
import {
  mapSocketStatus,
  shouldApplyStatus,
  isPendingStatus,
} from "./mapSocketStatus";
import { findTransitionIndexByDream } from "../utils/flow-progress.util";

// Safety net only. Joining a dream room replays the dream's real status, so a
// pending edge recovers on join/reconnect without polling; this covers an event
// dropped mid-session, which is rare enough not to warrant a tight loop.
const RECONCILE_POLL_MS = 30_000;

export function useFlowJobProgress() {
  const { socket } = useSocket();

  const transitions = useFlowStore((s) => s.transitions);

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

  const applyStatus = useCallback(
    (uuid: string, isUprez: boolean, rawStatus?: string, progress?: number) => {
      const { transitions: current } = useFlowStore.getState();
      const idx = findTransitionIndexByDream(current, uuid, isUprez);
      if (idx === -1) return;

      const currentStatus = isUprez
        ? current[idx].uprezStatus
        : current[idx].status;
      const mappedStatus = mapSocketStatus(rawStatus);

      const currentTracked =
        currentStatus === "queue" || currentStatus === "processing"
          ? currentStatus
          : undefined;
      const nextStatus = shouldApplyStatus(currentStatus, mappedStatus)
        ? mappedStatus
        : currentTracked;
      if (!nextStatus) return;

      const store = useFlowStore.getState();
      if (isUprez) {
        store.updateTransitionUprezStatus(idx, nextStatus, progress);
      } else {
        store.updateTransitionStatus(idx, nextStatus, progress);
      }
      return nextStatus;
    },
    [],
  );

  const handleProgress = useCallback(
    (data: {
      dreamUuid?: string;
      dream_uuid?: string;
      status?: string;
      progress?: number | null;
    }) => {
      const uuid = data.dreamUuid || data.dream_uuid;
      if (!uuid) return;

      const entry = uuidMap.get(uuid);
      if (!entry) return;

      const nextStatus = applyStatus(
        uuid,
        entry.isUprez,
        data.status,
        data.progress ?? undefined,
      );

      if (nextStatus === "failed") {
        fetchDream(uuid)
          .then((dream) => toastFailure(uuid, dream?.error))
          .catch(() => {});
      }
    },
    [uuidMap, applyStatus, toastFailure],
  );

  useEffect(() => {
    if (!socket) return;
    socket.on(JOB_PROGRESS_EVENT, handleProgress);
    return () => {
      socket.off(JOB_PROGRESS_EVENT, handleProgress);
    };
  }, [socket, handleProgress]);

  useDreamRooms(pendingUuids);

  useQueries({
    queries: pendingEntries.map((entry) => ({
      queryKey: [DREAM_QUERY_KEY, entry.uuid],
      queryFn: ({ signal }: QueryFunctionContext) =>
        getDreamResponse(entry.uuid, signal),
      select: (response: ApiResponse<{ dream: Dream }>) => response.data?.dream,
      refetchInterval: RECONCILE_POLL_MS,
      refetchIntervalInBackground: false,
      onSuccess: (dream: Dream | undefined) => {
        if (!dream) return;
        const status = dream.jobProgress?.status ?? dream.status;
        if (mapSocketStatus(status) === "failed") {
          toastFailure(entry.uuid, dream.error);
        }
        applyStatus(
          entry.uuid,
          entry.isUprez,
          status,
          dream.jobProgress?.progress ?? undefined,
        );
      },
    })),
  });
}
