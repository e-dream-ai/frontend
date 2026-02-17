import { useEffect, useRef, useMemo } from "react";
import useSocket from "@/hooks/useSocket";
import { axiosClient } from "@/client/axios.client";
import { useStudioStore } from "@/stores/studio.store";
import {
  JOB_PROGRESS_EVENT,
  JOIN_DREAM_ROOM_EVENT,
  LEAVE_DREAM_ROOM_EVENT,
} from "@/constants/remote-control.constants";

const POLL_INTERVAL_MS = 10_000;

export const useStudioJobProgress = () => {
  const { socket } = useSocket();
  const images = useStudioStore((s) => s.images);
  const updateImage = useStudioStore((s) => s.updateImage);
  const jobs = useStudioStore((s) => s.jobs);
  const updateJob = useStudioStore((s) => s.updateJob);
  const activeTab = useStudioStore((s) => s.activeTab);
  const incrementNewCompleted = useStudioStore((s) => s.incrementNewCompleted);

  // Refs for live data accessed inside socket/poll handlers (avoids effect churn)
  const imagesRef = useRef(images);
  const jobsRef = useRef(jobs);
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

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

  // Subscribe to Socket.IO rooms and handle progress events
  useEffect(() => {
    if (!socket || pendingUuids.length === 0) return;

    const joinRooms = () => {
      pendingUuids.forEach((uuid) => {
        socket.emit(JOIN_DREAM_ROOM_EVENT, uuid);
      });
    };

    // Join immediately if connected, and re-join on reconnect
    if (socket.connected) {
      joinRooms();
    }
    socket.on("connect", joinRooms);

    const handleProgress = (data: {
      dream_uuid: string;
      status?: string;
      progress?: number;
      preview_frame?: string;
    }) => {
      const { dream_uuid, progress, preview_frame } = data;

      const image = imagesRef.current.find((img) => img.uuid === dream_uuid);
      if (image) {
        updateImage(dream_uuid, {
          progress,
          previewFrame: preview_frame,
          status: data.status === "COMPLETED" ? "processed" : image.status,
        });
      }

      const job = jobsRef.current.find((j) => j.dreamUuid === dream_uuid);
      if (job) {
        const wasNotCompleted = job.status !== "processed";
        const isNowCompleted = data.status === "COMPLETED";

        updateJob(dream_uuid, {
          progress,
          previewFrame: preview_frame,
          status: isNowCompleted ? "processed" : job.status,
        });

        if (
          wasNotCompleted &&
          isNowCompleted &&
          activeTabRef.current !== "results"
        ) {
          incrementNewCompleted();
        }
      }
    };

    socket.on(JOB_PROGRESS_EVENT, handleProgress);

    return () => {
      socket.off("connect", joinRooms);
      socket.off(JOB_PROGRESS_EVENT, handleProgress);
      pendingUuids.forEach((uuid) => {
        socket.emit(LEAVE_DREAM_ROOM_EVENT, uuid);
      });
    };
  }, [socket, pendingUuids, updateImage, updateJob, incrementNewCompleted]);

  // Polling fallback with stable interval (ref-based callback)
  const pollPendingRef = useRef<() => Promise<void>>();
  useEffect(() => {
    pollPendingRef.current = async () => {
      const pendingImages = imagesRef.current.filter(
        (img) => img.status === "queue" || img.status === "processing",
      );
      const pendingJobs = jobsRef.current.filter(
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

          if (
            wasNotCompleted &&
            isNowCompleted &&
            activeTabRef.current !== "results"
          ) {
            incrementNewCompleted();
          }
        } catch {
          // Silently skip failed polls
        }
      }
    };
  }, [updateImage, updateJob, incrementNewCompleted]);

  const hasPending = pendingUuids.length > 0;

  useEffect(() => {
    if (!hasPending) return;

    const interval = setInterval(() => {
      pollPendingRef.current?.();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [hasPending]);
};
