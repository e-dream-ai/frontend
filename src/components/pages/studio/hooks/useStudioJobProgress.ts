import { useEffect, useRef, useMemo } from "react";
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
  const updateImage = useStudioStore((s) => s.updateImage);
  const jobs = useStudioStore((s) => s.jobs);
  const updateJob = useStudioStore((s) => s.updateJob);
  const activeTab = useStudioStore((s) => s.activeTab);
  const incrementNewCompleted = useStudioStore((s) => s.incrementNewCompleted);

  // Refs for live data accessed inside socket/poll handlers
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

  // Track which UUIDs have already triggered the badge increment
  const completedFlaggedUuids = useRef(new Set<string>());

  // Stable refs for store actions (never change)
  const updateImageRef = useRef(updateImage);
  const updateJobRef = useRef(updateJob);
  const incrementNewCompletedRef = useRef(incrementNewCompleted);
  useEffect(() => {
    updateImageRef.current = updateImage;
  }, [updateImage]);
  useEffect(() => {
    updateJobRef.current = updateJob;
  }, [updateJob]);
  useEffect(() => {
    incrementNewCompletedRef.current = incrementNewCompleted;
  }, [incrementNewCompleted]);

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

      const image = imagesRef.current.find((img) => img.uuid === dream_uuid);
      if (image) {
        updateImageRef.current(dream_uuid, {
          progress,
          previewFrame: preview_frame,
          ...(mappedStatus ? { status: mappedStatus } : {}),
        });
      }

      const job = jobsRef.current.find((j) => j.dreamUuid === dream_uuid);
      if (job) {
        const wasNotCompleted = job.status !== "processed";
        const isNowCompleted = mappedStatus === "processed";

        updateJobRef.current(dream_uuid, {
          progress,
          previewFrame: preview_frame,
          ...(mappedStatus ? { status: mappedStatus } : {}),
        });

        if (
          wasNotCompleted &&
          isNowCompleted &&
          !completedFlaggedUuids.current.has(dream_uuid) &&
          activeTabRef.current !== "results"
        ) {
          completedFlaggedUuids.current.add(dream_uuid);
          incrementNewCompletedRef.current();
        }
      }
    };

    socket.on(JOB_PROGRESS_EVENT, handleProgress);
    return () => {
      socket.off(JOB_PROGRESS_EVENT, handleProgress);
    };
  }, [socket]);

  // --- Effect 2: Join/leave socket rooms for pending UUIDs (diff-based) ---
  const joinedRoomsRef = useRef(new Set<string>());
  const socketRef = useRef(socket);
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const currentSet = new Set(pendingUuids);

    // Join rooms we haven't joined yet
    const toJoin = pendingUuids.filter(
      (uuid) => !joinedRoomsRef.current.has(uuid),
    );
    toJoin.forEach((uuid) => {
      socket.emit(JOIN_DREAM_ROOM_EVENT, uuid);
      joinedRoomsRef.current.add(uuid);
    });

    // Leave rooms no longer needed
    for (const uuid of joinedRoomsRef.current) {
      if (!currentSet.has(uuid)) {
        socket.emit(LEAVE_DREAM_ROOM_EVENT, uuid);
        joinedRoomsRef.current.delete(uuid);
      }
    }

    // On reconnect, rejoin all current rooms
    const handleReconnect = () => {
      joinedRoomsRef.current.forEach((uuid) => {
        socket.emit(JOIN_DREAM_ROOM_EVENT, uuid);
      });
    };
    socket.on("connect", handleReconnect);

    return () => {
      socket.off("connect", handleReconnect);
    };
  }, [socket, pendingUuids]);

  // --- Cleanup: leave all rooms on unmount ---
  useEffect(() => {
    const rooms = joinedRoomsRef.current;
    return () => {
      const s = socketRef.current;
      if (!s) return;
      rooms.forEach((uuid) => {
        s.emit(LEAVE_DREAM_ROOM_EVENT, uuid);
      });
      rooms.clear();
    };
  }, []);

  // --- Effect 3: Polling fallback ---
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
          updateImageRef.current(img.uuid, {
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

          updateJobRef.current(job.dreamUuid, {
            status: dream.status,
          });

          if (
            wasNotCompleted &&
            isNowCompleted &&
            !completedFlaggedUuids.current.has(job.dreamUuid) &&
            activeTabRef.current !== "results"
          ) {
            completedFlaggedUuids.current.add(job.dreamUuid);
            incrementNewCompletedRef.current();
          }
        } catch {
          // Silently skip failed polls
        }
      }
    };
  }, []);

  const hasPending = pendingUuids.length > 0;

  useEffect(() => {
    if (!hasPending) return;
    const interval = setInterval(() => {
      pollPendingRef.current?.();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [hasPending]);
};
