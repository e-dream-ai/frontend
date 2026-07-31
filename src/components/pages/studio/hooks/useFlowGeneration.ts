import { useCallback, useRef, useState } from "react";
import Bugsnag from "@bugsnag/js";
import { useFlowStore } from "@/stores/flow.store";
import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";
import { buildVideoAlgoParams } from "@/components/pages/studio/utils/build-video-algo-params";
import { resolveEffectiveSettings } from "@/components/pages/studio/utils/resolve-flow-settings";
import type { FlowKeyframe, FlowTransition } from "@/types/flow.types";
import queryClient from "@/api/query-client";
import { USER_QUERY_KEY } from "@/api/user/query/useUser";
import { ensureFlowKeyframe } from "@/components/pages/studio/utils/flow-keyframes";
import { useUploadImageDream } from "@/api/dream/mutation/useUploadImageDream";
import {
  type AspectRatioSetting,
  cropSignature,
  defaultCenterCrop,
  isFullFrameCrop,
  resolveFlowRatio,
  sizeStringForRatio,
} from "@/utils/aspect-crop";
import { cropImageToFile, loadImageDimensions } from "@/utils/crop-image";

// Cap concurrent dream creations so "Generate All" doesn't fan out 50+ requests at once.
const GENERATE_CONCURRENCY = 4;

/** Resolve the flow's numeric output ratio (auto = the majority keyframe shape). */
function resolveOutputRatio(
  keyframes: FlowKeyframe[],
  setting: AspectRatioSetting,
): number {
  return resolveFlowRatio(
    keyframes.map((k) =>
      k.naturalWidth && k.naturalHeight
        ? { width: k.naturalWidth, height: k.naturalHeight }
        : undefined,
    ),
    setting,
  );
}

export function useFlowGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const generatingCount = useRef(0);

  // Actions are stable refs — subscribe individually, not via useShallow.
  const setTransitionDream = useFlowStore((s) => s.setTransitionDream);
  const updateTransitionStatus = useFlowStore((s) => s.updateTransitionStatus);
  const updateKeyframe = useFlowStore((s) => s.updateKeyframe);
  const { mutateAsync: uploadImage } = useUploadImageDream();

  const generateTransition = useCallback(
    async (index: number, transition: FlowTransition) => {
      // Read latest store state directly — keeps the callback identity stable
      // and avoids re-creating it on every settings keystroke.
      const store = useFlowStore.getState();
      const settings = resolveEffectiveSettings(transition, {
        globalPresetId: store.globalPresetId,
        globalPrompt: store.globalPrompt,
        globalNegativePrompt: store.globalNegativePrompt,
        globalDuration: store.globalDuration,
        globalModel: store.globalModel,
        globalNumInferenceSteps: store.globalNumInferenceSteps,
        globalGuidance: store.globalGuidance,
        globalLora: store.globalLora,
      });

      const fromKf = store.keyframes.find(
        (kf) => kf.id === transition.fromKeyframeId,
      );
      if (!fromKf) {
        Bugsnag.notify(
          new Error(`Keyframe not found: ${transition.fromKeyframeId}`),
        );
        updateTransitionStatus(index, "failed");
        return;
      }

      const toKf = store.keyframes.find(
        (kf) => kf.id === transition.toKeyframeId,
      );
      if (!toKf) {
        Bugsnag.notify(
          new Error(`Keyframe not found: ${transition.toKeyframeId}`),
        );
        updateTransitionStatus(index, "failed");
        return;
      }

      const targetRatio = resolveOutputRatio(
        store.keyframes,
        store.globalAspectRatio,
      );

      // Crop each keyframe to the flow's output ratio and re-upload it as an
      // image Dream, so the i2v model receives a correctly-shaped source and
      // the video isn't distorted (#668). Returns the UUID/URL to feed the job;
      // falls back to the original reference on any crop/upload failure so a
      // CORS or network hiccup degrades gracefully rather than blocking.
      const ensureCroppedDream = async (kf: FlowKeyframe): Promise<string> => {
        const original = kf.dreamUuid || kf.imageUrl;
        if (!kf.imageUrl) return original;
        try {
          let { naturalWidth, naturalHeight } = kf;
          if (!naturalWidth || !naturalHeight) {
            const dims = await loadImageDimensions(kf.imageUrl);
            naturalWidth = dims.width;
            naturalHeight = dims.height;
          }
          const crop =
            kf.crop ??
            defaultCenterCrop(naturalWidth, naturalHeight, targetRatio);

          // Source already matches the output shape — no crop needed.
          if (isFullFrameCrop(crop)) return original;

          const sig = cropSignature(original, crop, targetRatio);
          if (kf.croppedSignature === sig && kf.croppedDreamUuid) {
            return kf.croppedDreamUuid;
          }

          const file = await cropImageToFile(
            kf.imageUrl,
            crop,
            kf.name || "frame",
          );
          const result = await uploadImage({ file });
          updateKeyframe(kf.id, {
            naturalWidth,
            naturalHeight,
            croppedDreamUuid: result.dreamUuid,
            croppedSignature: sig,
          });
          return result.dreamUuid;
        } catch (error) {
          Bugsnag.notify(error as Error);
          return original;
        }
      };

      const imageRef = await ensureCroppedDream(fromKf);
      const endImageRef = await ensureCroppedDream(toKf);

      const algoParams = buildVideoAlgoParams({
        model: settings.model,
        action: settings.action,
        imageUuid: imageRef,
        endImageUuid: endImageRef,
        imageSize: sizeStringForRatio(targetRatio),
        duration: settings.duration,
        numInferenceSteps: settings.numInferenceSteps,
        guidance: settings.guidance,
        negativePrompt: settings.negativePrompt,
      });
      const name = `${fromKf.name || "frame"} → ${toKf.name || "frame"}`;

      try {
        const headers = getRequestHeaders({ contentType: ContentType.json });
        const [startKeyframe, endKeyframe] = await Promise.all([
          ensureFlowKeyframe(fromKf),
          ensureFlowKeyframe(toKf),
        ]);
        const { data: createData } = await axiosClient.post(
          "/v1/dream",
          { name, prompt: JSON.stringify(algoParams) },
          { headers },
        );
        const dreamUuid = createData?.data?.dream?.uuid;
        if (!dreamUuid) {
          throw new Error("No dream UUID returned from API");
        }

        await axiosClient.put(
          `/v1/dream/${dreamUuid}`,
          { startKeyframe, endKeyframe },
          { headers },
        );

        setTransitionDream(index, dreamUuid);
        updateTransitionStatus(index, "queue");
      } catch (error) {
        Bugsnag.notify(error as Error);
        updateTransitionStatus(index, "failed");
      }
    },
    [setTransitionDream, updateTransitionStatus, updateKeyframe, uploadImage],
  );

  const startGenerating = useCallback(() => {
    generatingCount.current += 1;
    setIsGenerating(true);
  }, []);

  const stopGenerating = useCallback(() => {
    generatingCount.current -= 1;
    if (generatingCount.current <= 0) {
      generatingCount.current = 0;
      setIsGenerating(false);
    }
  }, []);

  const generateAll = useCallback(async () => {
    startGenerating();
    try {
      const { transitions: currentTransitions } = useFlowStore.getState();
      const targets: Array<{ index: number; t: FlowTransition }> = [];
      currentTransitions.forEach((t, index) => {
        if (
          t.status === "processed" ||
          t.status === "processing" ||
          t.status === "queue"
        ) {
          return;
        }
        targets.push({ index, t });
      });

      // Worker-pool style concurrency cap.
      let cursor = 0;
      const worker = async () => {
        while (cursor < targets.length) {
          const next = targets[cursor++];
          await generateTransition(next.index, next.t);
        }
      };
      await Promise.all(
        Array.from(
          { length: Math.min(GENERATE_CONCURRENCY, targets.length) },
          worker,
        ),
      );
      if (targets.length > 0) {
        await queryClient.invalidateQueries([USER_QUERY_KEY]);
      }
    } finally {
      stopGenerating();
    }
  }, [generateTransition, startGenerating, stopGenerating]);

  const generateOne = useCallback(
    async (index: number) => {
      startGenerating();
      try {
        const t = useFlowStore.getState().transitions[index];
        if (t) {
          await generateTransition(index, t);
        }
      } finally {
        stopGenerating();
      }
    },
    [generateTransition, startGenerating, stopGenerating],
  );

  return { generateAll, generateOne, isGenerating };
}
