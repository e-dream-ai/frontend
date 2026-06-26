import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "react-toastify";
import useSocket from "@/hooks/useSocket";
import { useStudioStore } from "@/stores/studio.store";
import { useSessionStore } from "@/stores/session.store";
import queryClient from "@/api/query-client";
import { DREAM_QUERY_KEY, fetchDream } from "@/api/dream/query/useDream";
import { USER_QUERY_KEY } from "@/api/user/query/useUser";
import {
  JOB_PROGRESS_EVENT,
  JOIN_DREAM_ROOM_EVENT,
  LEAVE_DREAM_ROOM_EVENT,
} from "@/constants/remote-control.constants";
import {
  mapSocketStatus,
  shouldApplyStatus,
  isPendingStatus,
  type DreamJobStatus,
} from "./mapSocketStatus";

const RECONCILE_POLL_MS = 5000;

export const useStudioJobProgress = () => {
  const { socket, isConnected } = useSocket();

  const pendingUuids = useStudioStore(
    useShallow((s) => {
      const imageUuids = s.images
        .filter((img) => isPendingStatus(img.status))
        .map((img) => img.uuid);
      const jobUuids = s.jobs
        .filter((j) => isPendingStatus(j.status))
        .map((j) => j.dreamUuid);
      return [...imageUuids, ...jobUuids];
    }),
  );

  useEffect(() => {
    if (!socket) return;

    const handleProgress = (data: {
      dream_uuid: string;
      status?: string;
      progress?: number;
      preview_frame?: string;
    }) => {
      const { dream_uuid, progress, preview_frame } = data;
      const mappedStatus = mapSocketStatus(data.status);
      const state = useStudioStore.getState();

      const image = state.images.find((img) => img.uuid === dream_uuid);
      if (image) {
        const applyStatus = shouldApplyStatus(image.status, mappedStatus);
        state.updateImage(dream_uuid, {
          progress,
          previewFrame: preview_frame,
          ...(applyStatus && mappedStatus ? { status: mappedStatus } : {}),
        });
      }

      const job = state.jobs.find((j) => j.dreamUuid === dream_uuid);
      if (job) {
        const applyStatus = shouldApplyStatus(job.status, mappedStatus);
        const wasPending =
          job.status !== "processed" && job.status !== "failed";
        const isNowCompleted = applyStatus && mappedStatus === "processed";
        const isNowFailed = applyStatus && mappedStatus === "failed";

        state.updateJob(dream_uuid, {
          progress,
          previewFrame: preview_frame,
          ...(applyStatus && mappedStatus ? { status: mappedStatus } : {}),
        });

        if (isNowCompleted) {
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
    };

    socket.on(JOB_PROGRESS_EVENT, handleProgress);
    return () => {
      socket.off(JOB_PROGRESS_EVENT, handleProgress);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || pendingUuids.length === 0) return;

    queryClient.invalidateQueries([USER_QUERY_KEY]);

    const joinRooms = () => {
      pendingUuids.forEach((uuid) => socket.emit(JOIN_DREAM_ROOM_EVENT, uuid));
    };

    if (socket.connected) joinRooms();
    socket.on("connect", joinRooms);

    return () => {
      socket.off("connect", joinRooms);
      pendingUuids.forEach((uuid) => socket.emit(LEAVE_DREAM_ROOM_EVENT, uuid));
    };
  }, [socket, pendingUuids]);

  const hasPending = pendingUuids.length > 0;
  const activeSessionId = useSessionStore((s) => s.activeSessionId);

  useEffect(() => {
    if (!hasPending) return;

    const reconcile = () => {
      const state = useStudioStore.getState();

      for (const img of state.images.filter((i) => isPendingStatus(i.status))) {
        fetchDream(img.uuid)
          .then((dream) => {
            if (!dream) return;
            if (dream.status === img.status) return;
            if (!shouldApplyStatus(img.status, dream.status)) return;
            useStudioStore.getState().updateImage(img.uuid, {
              status: dream.status as DreamJobStatus,
            });
          })
          .catch(() => {});
      }

      for (const job of state.jobs.filter((j) => isPendingStatus(j.status))) {
        fetchDream(job.dreamUuid)
          .then((dream) => {
            if (!dream) return;
            if (dream.status === job.status) return;
            if (!shouldApplyStatus(job.status, dream.status)) return;

            const wasNotCompleted = job.status !== "processed";
            const isNowCompleted = dream.status === "processed";

            useStudioStore.getState().updateJob(job.dreamUuid, {
              status: dream.status as DreamJobStatus,
              ...(isNowCompleted && dream.thumbnail
                ? { thumbnailUrl: dream.thumbnail }
                : {}),
            });

            if (wasNotCompleted && isNowCompleted) {
              queryClient.invalidateQueries([DREAM_QUERY_KEY, job.dreamUuid]);
              const s = useStudioStore.getState();
              if (s.activeTab !== "results") s.incrementNewCompleted();
            }
          })
          .catch(() => {});
      }
    };

    reconcile();

    const interval = isConnected
      ? null
      : setInterval(reconcile, RECONCILE_POLL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") reconcile();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [hasPending, activeSessionId, isConnected]);
};
