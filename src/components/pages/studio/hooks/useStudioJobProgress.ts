import { useQueries, type QueryFunctionContext } from "@tanstack/react-query";
import type { ApiResponse } from "@/types/api.types";
import type { Dream } from "@/types/dream.types";
import { useDreamRooms } from "@/hooks/useDreamRooms";
import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "react-toastify";
import useSocket from "@/hooks/useSocket";
import { useStudioStore } from "@/stores/studio.store";
import queryClient from "@/api/query-client";
import {
  DREAM_QUERY_KEY,
  fetchDream,
  getDreamResponse,
} from "@/api/dream/query/useDream";
import { USER_QUERY_KEY } from "@/api/user/query/useUser";
import { JOB_PROGRESS_EVENT } from "@/constants/remote-control.constants";
import { dreamMediaUrl } from "../utils/resolve-dream-media";
import { useDreamMediaResolver } from "./useDreamMediaResolver";
import {
  mapSocketStatus,
  shouldApplyStatus,
  isPendingStatus,
} from "./mapSocketStatus";

const RECONCILE_POLL_MS = 5000;

export const useStudioJobProgress = () => {
  const { socket, isConnected } = useSocket();
  const resolveMedia = useDreamMediaResolver();

  const pendingUuids = useStudioStore(
    useShallow((s) => {
      const imageUuids = s.images
        .filter((img) => isPendingStatus(img.status))
        .map((img) => img.uuid);
      const jobUuids = s.jobs
        .filter((j) => isPendingStatus(j.status))
        .map((j) => j.dreamUuid);
      return [...new Set([...imageUuids, ...jobUuids])];
    }),
  );

  const handleProgress = useCallback(
    (data: {
      dream_uuid: string;
      status?: string;
      progress?: number | null;
      preview_frame?: string;
    }) => {
      const { dream_uuid, progress, preview_frame } = data;
      const mappedStatus = mapSocketStatus(data.status);
      const state = useStudioStore.getState();

      const image = state.images.find((img) => img.uuid === dream_uuid);
      if (image) {
        const applyStatus = shouldApplyStatus(image.status, mappedStatus);
        state.updateImage(dream_uuid, {
          progress: progress ?? undefined,
          previewFrame: preview_frame,
          ...(applyStatus && mappedStatus ? { status: mappedStatus } : {}),
        });

        if (
          applyStatus &&
          mappedStatus === "processed" &&
          isPendingStatus(image.status) &&
          !image.url?.startsWith("http")
        ) {
          queryClient.invalidateQueries([DREAM_QUERY_KEY, dream_uuid]);
          resolveMedia(dream_uuid)
            .then((dream) => {
              const url = dreamMediaUrl(dream);
              if (url) {
                useStudioStore.getState().updateImage(dream_uuid, { url });
              }
            })
            .catch(() => {});
        }
      }

      const job = state.jobs.find((j) => j.dreamUuid === dream_uuid);
      if (job) {
        const applyStatus = shouldApplyStatus(job.status, mappedStatus);
        const wasPending =
          job.status !== "processed" && job.status !== "failed";
        const isNowCompleted = applyStatus && mappedStatus === "processed";
        const isNowFailed = applyStatus && mappedStatus === "failed";

        state.updateJob(dream_uuid, {
          progress: progress ?? undefined,
          previewFrame: preview_frame,
          ...(applyStatus && mappedStatus ? { status: mappedStatus } : {}),
        });

        if (isNowCompleted && wasPending) {
          queryClient.invalidateQueries([DREAM_QUERY_KEY, dream_uuid]);
          queryClient.invalidateQueries([USER_QUERY_KEY]);
          fetchDream(dream_uuid)
            .then((dream) => {
              if (dream?.thumbnail) {
                useStudioStore
                  .getState()
                  .updateJob(dream_uuid, { thumbnailUrl: dream.thumbnail });
              }
            })
            .catch(() => {});

          if (wasPending && state.activeTab !== "results") {
            state.incrementNewCompleted();
          }
        }

        if (isNowFailed && wasPending) {
          queryClient.invalidateQueries([DREAM_QUERY_KEY, dream_uuid]);
          queryClient.invalidateQueries([USER_QUERY_KEY]);
          fetchDream(dream_uuid)
            .then((dream) => {
              if (dream?.error) toast.error(dream.error);
            })
            .catch(() => {});
        }
      }
    },
    [resolveMedia],
  );

  useEffect(() => {
    if (!socket) return;
    socket.on(JOB_PROGRESS_EVENT, handleProgress);
    return () => {
      socket.off(JOB_PROGRESS_EVENT, handleProgress);
    };
  }, [socket, handleProgress]);

  useDreamRooms(pendingUuids);

  const hasPending = pendingUuids.length > 0;
  useEffect(() => {
    if (hasPending) void queryClient.invalidateQueries([USER_QUERY_KEY]);
  }, [hasPending]);

  useQueries({
    queries: pendingUuids.map((uuid) => ({
      queryKey: [DREAM_QUERY_KEY, uuid],
      queryFn: ({ signal }: QueryFunctionContext) =>
        getDreamResponse(uuid, signal),
      staleTime: 1000,
      refetchInterval: isConnected ? 30_000 : RECONCILE_POLL_MS,
      refetchOnWindowFocus: true,
      onSuccess: (response: ApiResponse<{ dream: Dream }>) => {
        const dream = response.data?.dream;
        if (!dream) return;
        handleProgress({
          dream_uuid: uuid,
          status: dream.jobProgress?.status ?? dream.status,
          progress: dream.jobProgress?.progress,
        });
      },
    })),
  });
};
