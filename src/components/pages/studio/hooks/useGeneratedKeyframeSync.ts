import { useEffect, useRef } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useFlowStore } from "@/stores/flow.store";
import { fetchDream } from "@/api/dream/query/useDream";
import type { StudioImage } from "@/types/studio.types";

const FAILED_CLEANUP_MS = 6000;

/**
 * Mirrors generation state onto keyframes created by the "+ Generate" dialog.
 *
 * Generated keyframes are placeholders (uploadStatus "uploading", a dreamUuid,
 * no imageUrl yet). Their backing image dreams are tracked on the shared
 * studio image list (socket + reconcile via useStudioJobProgress); this hook
 * copies progress onto the placeholder cards, swaps in the thumbnail when a
 * dream completes, and cleans up failures like the upload flow does.
 */
export const useGeneratedKeyframeSync = () => {
  const images = useStudioStore((s) => s.images);
  const resolving = useRef(new Set<string>());

  useEffect(() => {
    const { keyframes, updateKeyframe, removeKeyframe } =
      useFlowStore.getState();

    const finalize = (id: string, dreamUuid: string) => {
      if (resolving.current.has(id)) return;
      resolving.current.add(id);
      fetchDream(dreamUuid)
        .then((dream) => {
          const url =
            dream?.thumbnail || dream?.video || dream?.original_video || "";
          useFlowStore.getState().updateKeyframe(id, {
            imageUrl: url,
            name: dream?.name ?? undefined,
            uploadStatus: undefined,
            uploadProgress: undefined,
          });
        })
        .catch(() => {
          // Retry on the next images update
          resolving.current.delete(id);
        });
    };

    const fail = (id: string) => {
      updateKeyframe(id, { uploadStatus: "failed", uploadProgress: undefined });
      window.setTimeout(() => removeKeyframe(id), FAILED_CLEANUP_MS);
    };

    for (const kf of keyframes) {
      // Generated placeholders only — uploads carry a local objectURL preview.
      if (kf.uploadStatus !== "uploading" || !kf.dreamUuid || kf.imageUrl) {
        continue;
      }

      const img = images.find((i) => i.uuid === kf.dreamUuid);

      if (!img) {
        // Not tracked (e.g. studio session was switched or cleared). Fetch
        // once and re-register pending dreams so tracking resumes.
        if (resolving.current.has(kf.id)) continue;
        resolving.current.add(kf.id);
        const dreamUuid = kf.dreamUuid;
        fetchDream(dreamUuid)
          .then((dream) => {
            resolving.current.delete(kf.id);
            if (!dream) return;
            if (dream.status === "processed") {
              finalize(kf.id, dreamUuid);
            } else if (dream.status === "failed") {
              fail(kf.id);
            } else {
              useStudioStore.getState().addImage({
                uuid: dreamUuid,
                url: "",
                name: kf.name,
                status: dream.status as StudioImage["status"],
                selected: false,
              });
            }
          })
          .catch(() => {
            resolving.current.delete(kf.id);
          });
        continue;
      }

      if (img.status === "failed") {
        fail(kf.id);
      } else if (img.status === "processed") {
        finalize(kf.id, kf.dreamUuid);
      } else if ((img.progress ?? 0) !== (kf.uploadProgress ?? 0)) {
        updateKeyframe(kf.id, { uploadProgress: img.progress ?? 0 });
      }
    }
  }, [images]);
};
