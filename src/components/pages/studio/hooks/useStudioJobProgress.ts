import { useEffect, useRef, useCallback } from "react";
import useSocket from "@/hooks/useSocket";
import { axiosClient } from "@/client/axios.client";
import { useStudioStore } from "@/stores/studio.store";

const POLL_INTERVAL_MS = 10_000;

export const useStudioJobProgress = () => {
  const { socket } = useSocket();
  const images = useStudioStore((s) => s.images);
  const updateImage = useStudioStore((s) => s.updateImage);
  const jobs = useStudioStore((s) => s.jobs);
  const updateJob = useStudioStore((s) => s.updateJob);
  const activeTab = useStudioStore((s) => s.activeTab);
  const incrementNewCompleted = useStudioStore((s) => s.incrementNewCompleted);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subscribe to Socket.IO rooms for all pending dreams
  useEffect(() => {
    if (!socket) return;

    const pendingImageUuids = images
      .filter((img) => img.status === "queue" || img.status === "processing")
      .map((img) => img.uuid);

    const pendingJobUuids = jobs
      .filter((j) => j.status === "queue" || j.status === "processing")
      .map((j) => j.dreamUuid);

    const allUuids = [...pendingImageUuids, ...pendingJobUuids];

    allUuids.forEach((uuid) => {
      socket.emit("join_dream_room", uuid);
    });

    const handleProgress = (data: {
      dream_uuid: string;
      status?: string;
      progress?: number;
      preview_frame?: string;
    }) => {
      const { dream_uuid, progress, preview_frame } = data;

      // Check if this is an image
      const image = images.find((img) => img.uuid === dream_uuid);
      if (image) {
        updateImage(dream_uuid, {
          progress,
          previewFrame: preview_frame,
          status: data.status === "COMPLETED" ? "processed" : image.status,
        });
      }

      // Check if this is a job
      const job = jobs.find((j) => j.dreamUuid === dream_uuid);
      if (job) {
        const wasNotCompleted = job.status !== "processed";
        const isNowCompleted = data.status === "COMPLETED";

        updateJob(dream_uuid, {
          progress,
          previewFrame: preview_frame,
          status: isNowCompleted ? "processed" : job.status,
        });

        if (wasNotCompleted && isNowCompleted && activeTab !== "results") {
          incrementNewCompleted();
        }
      }
    };

    socket.on("job:progress", handleProgress);

    return () => {
      socket.off("job:progress", handleProgress);
      allUuids.forEach((uuid) => {
        socket.emit("leave_dream_room", uuid);
      });
    };
  }, [
    socket,
    images,
    jobs,
    updateImage,
    updateJob,
    activeTab,
    incrementNewCompleted,
  ]);

  // Polling fallback: check status of pending items periodically
  const pollPending = useCallback(async () => {
    const pendingImages = images.filter(
      (img) => img.status === "queue" || img.status === "processing",
    );
    const pendingJobs = jobs.filter(
      (j) => j.status === "queue" || j.status === "processing",
    );

    for (const img of pendingImages) {
      try {
        const { data } = await axiosClient.get(`/v1/dream/${img.uuid}`);
        const dream = data.data.dream;
        updateImage(img.uuid, {
          status: dream.status,
          url: dream.thumbnail || dream.video || img.url,
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

        updateJob(job.dreamUuid, {
          status: dream.status,
        });

        if (wasNotCompleted && isNowCompleted && activeTab !== "results") {
          incrementNewCompleted();
        }
      } catch {
        // Silently skip failed polls
      }
    }
  }, [images, jobs, updateImage, updateJob, activeTab, incrementNewCompleted]);

  useEffect(() => {
    const hasPending =
      images.some(
        (img) => img.status === "queue" || img.status === "processing",
      ) || jobs.some((j) => j.status === "queue" || j.status === "processing");

    if (hasPending) {
      pollRef.current = setInterval(pollPending, POLL_INTERVAL_MS);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [images, jobs, pollPending]);
};
