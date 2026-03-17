import { useEffect, useMemo } from "react";
import useSocket from "@/hooks/useSocket";
import { axiosClient } from "@/client/axios.client";
import { useStudioStore } from "@/stores/studio.store";
import {
  JOB_PROGRESS_EVENT,
  JOIN_DREAM_ROOM_EVENT,
  LEAVE_DREAM_ROOM_EVENT,
} from "@/constants/remote-control.constants";
import { mapSocketStatus } from "./mapSocketStatus";

const POLL_INTERVAL_MS = 10_000;

export const useStudioJobProgress = () => {
  const { socket } = useSocket();
  const images = useStudioStore((s) => s.images);
  const jobs = useStudioStore((s) => s.jobs);

  // Stable set of pending UUIDs that need socket rooms
  const pendingUuids = useMemo(() => {
    const imageUuids = images
      .filter((img) => img.status === "queue" || img.status === "processing")
      .map((img) => img.uuid);
    const jobUuids = jobs
      .filter((j) => j.status === "queue" || j.status === "processing")
      .map((j) => j.dreamUuid);
    return [...imageUuids, ...jobUuids];
  }, [images, jobs]);

  // --- Effect 1: Register JOB_PROGRESS_EVENT listener ONCE per socket ---
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
        state.updateImage(dream_uuid, {
          progress,
          previewFrame: preview_frame,
          ...(mappedStatus ? { status: mappedStatus } : {}),
        });
      }

      const job = state.jobs.find((j) => j.dreamUuid === dream_uuid);
      if (job) {
        const wasNotCompleted = job.status !== "processed";
        const isNowCompleted = mappedStatus === "processed";

        state.updateJob(dream_uuid, {
          progress,
          previewFrame: preview_frame,
          ...(mappedStatus ? { status: mappedStatus } : {}),
        });

        if (
          wasNotCompleted &&
          isNowCompleted &&
          state.activeTab !== "results"
        ) {
          state.incrementNewCompleted();
        }
      }
    };

    socket.on(JOB_PROGRESS_EVENT, handleProgress);
    return () => {
      socket.off(JOB_PROGRESS_EVENT, handleProgress);
    };
  }, [socket]);

  // --- Effect 2: Join/leave socket rooms for pending UUIDs ---
  useEffect(() => {
    if (!socket || pendingUuids.length === 0) return;

    const joinRooms = () => {
      pendingUuids.forEach((uuid) => {
        socket.emit(JOIN_DREAM_ROOM_EVENT, uuid);
      });
    };

    if (socket.connected) joinRooms();
    socket.on("connect", joinRooms);

    return () => {
      socket.off("connect", joinRooms);
      pendingUuids.forEach((uuid) => {
        socket.emit(LEAVE_DREAM_ROOM_EVENT, uuid);
      });
    };
  }, [socket, pendingUuids]);

  const hasPending = pendingUuids.length > 0;

  useEffect(() => {
    if (!hasPending) return;

    const pollPending = async () => {
      const state = useStudioStore.getState();

      const pendingImages = state.images.filter(
        (img) => img.status === "queue" || img.status === "processing",
      );
      const pendingJobs = state.jobs.filter(
        (j) => j.status === "queue" || j.status === "processing",
      );

      for (const img of pendingImages) {
        try {
          const { data } = await axiosClient.get(`/v1/dream/${img.uuid}`);
          const dream = data.data.dream;
          state.updateImage(img.uuid, {
            status: dream.status,
          });
        } catch {
          // Silently skip failed polls
        }
      }

      for (const job of pendingJobs) {
        try {
          const { data } = await axiosClient.get(`/v1/dream/${job.dreamUuid}`);
          const dream = data.data.dream;
          const wasNotCompleted = job.status !== "processed";
          const isNowCompleted = dream.status === "processed";

          state.updateJob(job.dreamUuid, {
            status: dream.status,
          });

          if (
            wasNotCompleted &&
            isNowCompleted &&
            state.activeTab !== "results"
          ) {
            state.incrementNewCompleted();
          }
        } catch {
          // Silently skip failed polls
        }
      }
    };

    const interval = setInterval(pollPending, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [hasPending]);
};
