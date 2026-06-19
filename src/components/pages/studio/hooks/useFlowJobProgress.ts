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

type PendingEntry = {
  uuid: string;
  index: number;
  isUprez: boolean;
  // Variation tracking — when set, the entry is a variation candidate
  variationType?: "keyframe" | "transition";
  variationKeyframeId?: string;
  variationId?: string;
  // i2i candidate tracking — when set, the entry is a staged i2i candidate
  // keyframe (top-level keyframe with i2iParentId), not a kf.variations entry.
  i2iCandidateId?: string;
};

export function useFlowJobProgress() {
  const { socket } = useSocket();

  const transitions = useFlowStore((s) => s.transitions);
  const keyframes = useFlowStore((s) => s.keyframes);
  const updateTransitionStatus = useFlowStore((s) => s.updateTransitionStatus);

  // Collect pending entries from transitions AND variation candidates
  const { pendingEntries, pendingUuids, uuidMap } = useMemo(() => {
    const entries: PendingEntry[] = [];

    // Transition dreams (existing)
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
      // Transition variation candidates
      t.variations?.forEach((v) => {
        if (
          v.dreamUuid &&
          (v.status === "queue" || v.status === "processing")
        ) {
          entries.push({
            uuid: v.dreamUuid,
            index: i,
            isUprez: false,
            variationType: "transition",
            variationId: v.id,
          });
        }
      });
    });

    // Keyframe variation candidates
    keyframes.forEach((kf) => {
      kf.variations?.forEach((v) => {
        if (
          v.dreamUuid &&
          (v.status === "queue" || v.status === "processing")
        ) {
          entries.push({
            uuid: v.dreamUuid,
            index: -1,
            isUprez: false,
            variationType: "keyframe",
            variationKeyframeId: kf.id,
            variationId: v.id,
          });
        }
      });

      // i2i candidate keyframes — staged top-level keyframes whose own dream is
      // still generating. Track them so we can swap the placeholder source image
      // for each candidate's distinct result once it is processed.
      if (
        kf.i2iCandidate &&
        kf.dreamUuid &&
        (kf.i2iStatus === "queue" || kf.i2iStatus === "processing")
      ) {
        entries.push({
          uuid: kf.dreamUuid,
          index: -1,
          isUprez: false,
          i2iCandidateId: kf.id,
        });
      }
    });

    const uuids = entries.map((e) => e.uuid);
    const map = new Map(entries.map((e) => [e.uuid, e]));
    return { pendingEntries: entries, pendingUuids: uuids, uuidMap: map };
  }, [transitions, keyframes]);

  // Handle job:progress events
  const handleProgress = useCallback(
    async (data: {
      dreamUuid?: string;
      dream_uuid?: string;
      status?: string;
      progress?: number;
    }) => {
      try {
        const uuid = data.dreamUuid || data.dream_uuid;
        if (!uuid) return;

        const entry = uuidMap.get(uuid);
        if (!entry) return;

        const mappedStatus = mapStatus(data.status ?? "");
        if (!mappedStatus) return;

        // i2i candidate keyframe progress — swap the placeholder source image
        // for this candidate's own result once its dream is processed.
        if (entry.i2iCandidateId) {
          const patch: {
            i2iStatus: typeof mappedStatus;
            imageUrl?: string;
          } = { i2iStatus: mappedStatus };
          if (mappedStatus === "processed") {
            try {
              const headers = getRequestHeaders({
                contentType: ContentType.json,
              });
              const { data: dreamData } = await axiosClient.get(
                `/v1/dream/${uuid}`,
                { headers },
              );
              const dream = dreamData?.data?.dream;
              if (dream) {
                patch.imageUrl =
                  dream.video || dream.original_video || dream.thumbnail || "";
              }
            } catch {
              // Non-fatal — imageUrl will be resolved by the next poll cycle.
            }
            // If the result URL didn't resolve, stay pending so the poll
            // fallback retries instead of freezing on the placeholder image.
            if (!patch.imageUrl) patch.i2iStatus = "processing";
          }
          useFlowStore.getState().updateKeyframe(entry.i2iCandidateId, patch);
          return;
        }

        // Variation candidate progress
        if (entry.variationType && entry.variationId) {
          const patch: {
            status: typeof mappedStatus;
            progress?: number;
            imageUrl?: string;
          } = {
            status: mappedStatus,
            progress: data.progress,
          };

          // When a variation dream completes via Socket.IO, fetch the dream to
          // resolve imageUrl (Socket.IO events don't carry the URL).
          if (mappedStatus === "processed") {
            try {
              const headers = getRequestHeaders({
                contentType: ContentType.json,
              });
              const { data: dreamData } = await axiosClient.get(
                `/v1/dream/${uuid}`,
                { headers },
              );
              const dream = dreamData?.data?.dream;
              if (dream) {
                patch.imageUrl =
                  dream.video || dream.original_video || dream.thumbnail || "";
              }
            } catch {
              // Non-fatal — imageUrl will be resolved by the next poll cycle.
            }
          }

          if (entry.variationType === "keyframe" && entry.variationKeyframeId) {
            useFlowStore
              .getState()
              .updateKeyframeVariation(
                entry.variationKeyframeId,
                entry.variationId,
                patch,
              );
          } else if (entry.variationType === "transition") {
            useFlowStore
              .getState()
              .updateTransitionVariation(entry.index, entry.variationId, patch);
          }
          return;
        }

        // Standard transition progress (existing)
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
      } catch (err) {
        Bugsnag.notify(err as Error);
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

          // i2i candidate keyframe — swap the placeholder source image for this
          // candidate's own result once processed.
          if (entry.i2iCandidateId) {
            const patch: {
              i2iStatus: typeof mappedStatus;
              imageUrl?: string;
            } = { i2iStatus: mappedStatus };
            if (mappedStatus === "processed") {
              patch.imageUrl =
                dream.video || dream.original_video || dream.thumbnail || "";
            }
            useFlowStore.getState().updateKeyframe(entry.i2iCandidateId, patch);
            continue;
          }

          // Variation candidate — update with status + imageUrl when processed
          if (entry.variationType && entry.variationId) {
            const patch: {
              status: typeof mappedStatus;
              progress?: number;
              imageUrl?: string;
            } = {
              status: mappedStatus,
            };
            if (mappedStatus === "processed") {
              // Match the field priority from useUploadImageDream:
              // video (R2 URL) > original_video > thumbnail
              patch.imageUrl =
                dream.video || dream.original_video || dream.thumbnail || "";
            }
            if (
              entry.variationType === "keyframe" &&
              entry.variationKeyframeId
            ) {
              useFlowStore
                .getState()
                .updateKeyframeVariation(
                  entry.variationKeyframeId,
                  entry.variationId,
                  patch,
                );
            } else if (entry.variationType === "transition") {
              useFlowStore
                .getState()
                .updateTransitionVariation(
                  entry.index,
                  entry.variationId,
                  patch,
                );
            }
            continue;
          }

          // Standard transition progress (existing)
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

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pendingUuids.length]);
}
