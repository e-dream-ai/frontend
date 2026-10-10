import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueries, type QueryFunctionContext } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { ApiResponse } from "@/types/api.types";
import type { Dream } from "@/types/dream.types";
import type { DeforumRenderStatus } from "@/types/deforum.types";
import queryClient from "@/api/query-client";
import { USER_QUERY_KEY } from "@/api/user/query/useUser";
import {
  DREAM_QUERY_KEY,
  fetchDream,
  getDreamResponse,
} from "@/api/dream/query/useDream";
import { useDeforumStore } from "@/stores/deforum.store";
import { useSocket } from "@/hooks/useSocket";
import { useDreamRooms } from "@/hooks/useDreamRooms";
import { JOB_PROGRESS_EVENT } from "@/constants/remote-control.constants";
import {
  isPendingStatus,
  mapSocketStatus,
  shouldApplyStatus,
} from "./mapSocketStatus";

// Safety net only, as in the flow: joining a dream room replays its status.
const RECONCILE_POLL_MS = 30_000;

const findRenderStatus = (dreamUuid: string) => {
  for (const clip of useDeforumStore.getState().clips) {
    for (const render of [clip.test, clip.final]) {
      if (render?.dreamUuid === dreamUuid) return render.status;
    }
  }
  return null;
};

/** Follows every in-flight deforum render — test and final — to completion. */
export function useDeforumJobProgress() {
  const { socket } = useSocket();
  const clips = useDeforumStore((s) => s.clips);

  const pendingUuids = useMemo(
    () =>
      clips.flatMap((clip) =>
        [clip.test, clip.final]
          .filter((r) => r && isPendingStatus(r.status))
          .map((r) => r!.dreamUuid),
      ),
    [clips],
  );

  const toasted = useRef(new Set<string>());
  const toastFailure = useCallback((uuid: string, error?: string | null) => {
    if (!error || toasted.current.has(uuid)) return;
    toasted.current.add(uuid);
    toast.error(error);
  }, []);

  const applyStatus = useCallback(
    (uuid: string, raw?: string, progress?: number, stage?: string) => {
      const current = findRenderStatus(uuid);
      if (current === null) return;
      const mapped = mapSocketStatus(raw, stage);
      if (!shouldApplyStatus(current, mapped)) return;
      const next = mapped as DeforumRenderStatus;
      useDeforumStore.getState().updateRenderStatus(uuid, next, progress);
      if (next === "failed" || next === "processed") {
        void queryClient.invalidateQueries([USER_QUERY_KEY]);
      }
      return next;
    },
    [],
  );

  const handleProgress = useCallback(
    (data: {
      dreamUuid?: string;
      dream_uuid?: string;
      status?: string;
      stage?: string;
      progress?: number | null;
    }) => {
      const uuid = data.dreamUuid || data.dream_uuid;
      if (!uuid) return;
      const next = applyStatus(
        uuid,
        data.status,
        data.progress ?? undefined,
        data.stage,
      );
      if (next === "failed") {
        fetchDream(uuid)
          .then((dream) => toastFailure(uuid, dream?.error))
          .catch(() => {});
      }
    },
    [applyStatus, toastFailure],
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
    queries: pendingUuids.map((uuid) => ({
      queryKey: [DREAM_QUERY_KEY, uuid],
      queryFn: ({ signal }: QueryFunctionContext) =>
        getDreamResponse(uuid, signal),
      select: (response: ApiResponse<{ dream: Dream }>) => response.data?.dream,
      refetchInterval: RECONCILE_POLL_MS,
      refetchIntervalInBackground: false,
      onSuccess: (dream: Dream | undefined) => {
        if (!dream) return;
        const done = dream.status === "processed";
        const status = done
          ? dream.status
          : dream.jobProgress?.status ?? dream.status;
        const stage = done ? undefined : dream.jobProgress?.stage;
        if (mapSocketStatus(status, stage) === "failed") {
          toastFailure(uuid, dream.error);
        }
        applyStatus(
          uuid,
          status,
          dream.jobProgress?.progress ?? undefined,
          stage,
        );
      },
    })),
  });
}
