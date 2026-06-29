import { useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { useFlowStore } from "@/stores/flow.store";
import { useSessionStore } from "@/stores/session.store";
import { useSocket } from "@/hooks/useSocket";
import { fetchDream } from "@/api/dream/query/useDream";
import {
  JOB_PROGRESS_EVENT,
  JOIN_DREAM_ROOM_EVENT,
  LEAVE_DREAM_ROOM_EVENT,
} from "@/constants/remote-control.constants";
import {
  mapSocketStatus,
  shouldApplyStatus,
  isPendingStatus,
} from "./mapSocketStatus";
import type { Dream } from "@/types/dream.types";

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

// Result URL priority matches useUploadImageDream: video (R2) > original_video
// > thumbnail. Used to swap a candidate placeholder for its distinct result.
const resultUrlFromDream = (dream: Dream): string =>
  dream.video || dream.original_video || dream.thumbnail || "";

export function useFlowJobProgress() {
  const { socket, isConnected } = useSocket();

  const transitions = useFlowStore((s) => s.transitions);
  const keyframes = useFlowStore((s) => s.keyframes);
  const updateTransitionStatus = useFlowStore((s) => s.updateTransitionStatus);

  const toastedFailuresRef = useRef<Set<string>>(new Set());
  const toastFailure = useCallback((uuid: string, error?: string | null) => {
    if (toastedFailuresRef.current.has(uuid)) return;
    toastedFailuresRef.current.add(uuid);
    if (error) toast.error(error);
  }, []);

  const { pendingEntries, pendingUuids, uuidMap } = useMemo(() => {
    const entries: PendingEntry[] = [];
    transitions.forEach((t, i) => {
      if (t.dreamUuid && isPendingStatus(t.status)) {
        entries.push({ uuid: t.dreamUuid, index: i, isUprez: false });
      }
      if (t.uprezDreamUuid && isPendingStatus(t.uprezStatus)) {
        entries.push({ uuid: t.uprezDreamUuid, index: i, isUprez: true });
      }
      // Transition variation candidates
      t.variations?.forEach((v) => {
        if (v.dreamUuid && isPendingStatus(v.status)) {
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

    keyframes.forEach((kf) => {
      // Keyframe variation candidates
      kf.variations?.forEach((v) => {
        if (v.dreamUuid && isPendingStatus(v.status)) {
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
      if (kf.i2iCandidate && kf.dreamUuid && isPendingStatus(kf.i2iStatus)) {
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

  const handleProgress = useCallback(
    async (data: {
      dreamUuid?: string;
      dream_uuid?: string;
      status?: string;
      progress?: number;
    }) => {
      const uuid = data.dreamUuid || data.dream_uuid;
      if (!uuid) return;

      const entry = uuidMap.get(uuid);
      if (!entry) return;

      const mapped = mapSocketStatus(data.status);

      // i2i candidate keyframe progress — swap the placeholder source image for
      // this candidate's own result once its dream is processed.
      if (entry.i2iCandidateId) {
        if (!mapped) return;
        const patch: { i2iStatus: typeof mapped; imageUrl?: string } = {
          i2iStatus: mapped,
        };
        if (mapped === "processed") {
          try {
            const dream = await fetchDream(uuid);
            if (dream) patch.imageUrl = resultUrlFromDream(dream);
          } catch {
            // Non-fatal — imageUrl will be resolved by the next poll cycle.
          }
          // If the result URL didn't resolve, stay pending so the poll fallback
          // retries instead of freezing on the placeholder image.
          if (!patch.imageUrl) patch.i2iStatus = "processing";
        }
        useFlowStore.getState().updateKeyframe(entry.i2iCandidateId, patch);
        return;
      }

      // Variation candidate progress — Socket.IO events don't carry the URL, so
      // fetch the dream to resolve imageUrl once processed.
      if (entry.variationType && entry.variationId) {
        if (!mapped) return;
        const patch: {
          status: typeof mapped;
          progress?: number;
          imageUrl?: string;
        } = { status: mapped, progress: data.progress };
        if (mapped === "processed") {
          try {
            const dream = await fetchDream(uuid);
            if (dream) patch.imageUrl = resultUrlFromDream(dream);
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

      const transition = useFlowStore.getState().transitions[entry.index];
      if (!transition) return;

      const current = entry.isUprez
        ? transition.uprezStatus
        : transition.status;
      const mappedStatus = mapSocketStatus(data.status);

      const currentTracked =
        current === "queue" || current === "processing" ? current : undefined;
      const nextStatus = shouldApplyStatus(current, mappedStatus)
        ? mappedStatus
        : currentTracked;

      if (!nextStatus) return;

      if (entry.isUprez) {
        useFlowStore
          .getState()
          .updateTransitionUprezStatus(entry.index, nextStatus, data.progress);
      } else {
        updateTransitionStatus(entry.index, nextStatus, data.progress);
      }

      if (nextStatus === "failed") {
        fetchDream(uuid)
          .then((dream) => toastFailure(uuid, dream?.error))
          .catch(() => {});
      }
    },
    [uuidMap, updateTransitionStatus, toastFailure],
  );

  useEffect(() => {
    if (!socket) return;
    socket.on(JOB_PROGRESS_EVENT, handleProgress);
    return () => {
      socket.off(JOB_PROGRESS_EVENT, handleProgress);
    };
  }, [socket, handleProgress]);

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

  const pendingEntriesRef = useRef(pendingEntries);
  pendingEntriesRef.current = pendingEntries;

  const activeSessionId = useSessionStore((s) => s.activeSessionId);

  useEffect(() => {
    if (pendingUuids.length === 0) return;

    for (const entry of pendingEntriesRef.current) {
      fetchDream(entry.uuid)
        .then((dream) => {
          if (!dream) return;

          const mappedStatus = mapSocketStatus(dream.status);
          if (!mappedStatus) return;

          if (mappedStatus === "failed") toastFailure(entry.uuid, dream.error);

          // i2i candidate keyframe — swap the placeholder source image for this
          // candidate's own result once processed.
          if (entry.i2iCandidateId) {
            const patch: { i2iStatus: typeof mappedStatus; imageUrl?: string } =
              { i2iStatus: mappedStatus };
            if (mappedStatus === "processed") {
              patch.imageUrl = resultUrlFromDream(dream);
            }
            useFlowStore.getState().updateKeyframe(entry.i2iCandidateId, patch);
            return;
          }

          // Variation candidate — update status + imageUrl when processed.
          if (entry.variationType && entry.variationId) {
            const patch: {
              status: typeof mappedStatus;
              imageUrl?: string;
            } = { status: mappedStatus };
            if (mappedStatus === "processed") {
              patch.imageUrl = resultUrlFromDream(dream);
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
            return;
          }

          const transition = useFlowStore.getState().transitions[entry.index];
          const current = entry.isUprez
            ? transition?.uprezStatus
            : transition?.status;
          if (!shouldApplyStatus(current, mappedStatus)) return;

          if (entry.isUprez) {
            useFlowStore
              .getState()
              .updateTransitionUprezStatus(entry.index, mappedStatus);
          } else {
            useFlowStore
              .getState()
              .updateTransitionStatus(entry.index, mappedStatus);
          }
        })
        .catch(() => {});
    }
  }, [pendingUuids.length, activeSessionId, isConnected, toastFailure]);
}
