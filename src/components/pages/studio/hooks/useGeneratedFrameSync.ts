import { useEffect, useRef } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useFlowStore } from "@/stores/flow.store";
import { fetchDream } from "@/api/dream/query/useDream";
import type { StudioImage } from "@/types/studio.types";
import { dreamMediaUrl } from "../utils/resolve-dream-media";
import { useDreamMediaResolver } from "./useDreamMediaResolver";

const FAILED_CLEANUP_MS = 6000;

/**
 * Mirrors generation state onto referenceFrames created by the "+ Generate" dialog.
 *
 * Generated referenceFrames are placeholders (uploadStatus "uploading", a dreamUuid,
 * no imageUrl yet). Their backing image dreams are tracked on the shared
 * studio image list (socket + reconcile via useStudioJobProgress); this hook
 * copies progress onto the placeholder cards, swaps in the thumbnail when a
 * dream completes, and cleans up failures like the upload flow does.
 */
export const useGeneratedFrameSync = () => {
  const images = useStudioStore((s) => s.images);
  const resolving = useRef(new Set<string>());
  const resolveMedia = useDreamMediaResolver();

  useEffect(() => {
    const { referenceFrames, updateReferenceFrame, removeReferenceFrame } =
      useFlowStore.getState();

    const finalize = (id: string, dreamUuid: string) => {
      if (resolving.current.has(id)) return;
      resolving.current.add(id);
      updateReferenceFrame(id, { uploadProgress: 100 });
      resolveMedia(dreamUuid)
        .then((dream) => {
          const url = dreamMediaUrl(dream);
          if (!url) {
            fail(id);
            return;
          }
          useStudioStore.getState().updateImage(dreamUuid, { url });
          useFlowStore.getState().updateReferenceFrame(id, {
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
      updateReferenceFrame(id, {
        uploadStatus: "failed",
        uploadProgress: undefined,
      });
      window.setTimeout(() => removeReferenceFrame(id), FAILED_CLEANUP_MS);
    };

    for (const frame of referenceFrames) {
      // Generated placeholders only — uploads carry a local objectURL preview.
      if (
        frame.uploadStatus !== "uploading" ||
        !frame.dreamUuid ||
        frame.imageUrl
      ) {
        continue;
      }

      const img = images.find((i) => i.uuid === frame.dreamUuid);

      if (!img) {
        // Not tracked (e.g. studio session was switched or cleared). Fetch
        // once and re-register pending dreams so tracking resumes.
        if (resolving.current.has(frame.id)) continue;
        resolving.current.add(frame.id);
        const dreamUuid = frame.dreamUuid;
        fetchDream(dreamUuid)
          .then((dream) => {
            resolving.current.delete(frame.id);
            if (!dream) return;
            if (dream.status === "processed") {
              finalize(frame.id, dreamUuid);
            } else if (dream.status === "failed") {
              fail(frame.id);
            } else {
              useStudioStore.getState().addImage({
                uuid: dreamUuid,
                url: "",
                name: frame.name,
                status: dream.status as StudioImage["status"],
                selected: false,
              });
            }
          })
          .catch(() => {
            resolving.current.delete(frame.id);
          });
        continue;
      }

      if (img.status === "failed") {
        fail(frame.id);
      } else if (img.status === "processed") {
        finalize(frame.id, frame.dreamUuid);
      } else if ((img.progress ?? 0) !== (frame.uploadProgress ?? 0)) {
        updateReferenceFrame(frame.id, { uploadProgress: img.progress ?? 0 });
      }
    }
  }, [images, resolveMedia]);
};
