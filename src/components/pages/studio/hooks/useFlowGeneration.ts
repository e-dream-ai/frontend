import { useCallback, useMemo, useRef, useState } from "react";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";
import { buildVideoAlgoParams } from "@/components/pages/studio/utils/build-video-algo-params";
import { resolveEffectiveSettings } from "@/components/pages/studio/utils/resolve-flow-settings";
import type { FlowTransition } from "@/types/flow.types";

export function useFlowGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const generatingCount = useRef(0);

  const {
    keyframes,
    globalPresetId,
    globalPrompt,
    globalDuration,
    globalModel,
    globalNumInferenceSteps,
    globalGuidance,
    setTransitionDream,
    updateTransitionStatus,
  } = useFlowStore(
    useShallow((s) => ({
      keyframes: s.keyframes,
      globalPresetId: s.globalPresetId,
      globalPrompt: s.globalPrompt,
      globalDuration: s.globalDuration,
      globalModel: s.globalModel,
      globalNumInferenceSteps: s.globalNumInferenceSteps,
      globalGuidance: s.globalGuidance,
      setTransitionDream: s.setTransitionDream,
      updateTransitionStatus: s.updateTransitionStatus,
    })),
  );

  const globalSettings = useMemo(
    () => ({
      globalPresetId,
      globalPrompt,
      globalDuration,
      globalModel,
      globalNumInferenceSteps,
      globalGuidance,
    }),
    [
      globalPresetId,
      globalPrompt,
      globalDuration,
      globalModel,
      globalNumInferenceSteps,
      globalGuidance,
    ],
  );

  const generateTransition = useCallback(
    async (index: number, transition: FlowTransition) => {
      const settings = resolveEffectiveSettings(transition, globalSettings);

      // Find keyframe data for image reference
      const fromKf = keyframes.find(
        (kf) => kf.id === transition.fromKeyframeId,
      );
      if (!fromKf) {
        console.error(`Keyframe not found: ${transition.fromKeyframeId}`);
        updateTransitionStatus(index, "failed");
        return;
      }

      // Build algo params
      const algoParams = buildVideoAlgoParams({
        model: settings.model,
        action: settings.action,
        imageUuid: fromKf.keyframeUuid,
        imageSize: undefined,
        duration: settings.duration,
        numInferenceSteps: settings.numInferenceSteps,
        guidance: settings.guidance,
      });

      // Find to-keyframe name for auto-naming
      const toKf = keyframes.find((kf) => kf.id === transition.toKeyframeId);
      const name = `${fromKf.name || "frame"} → ${toKf?.name || "frame"}`;

      try {
        // Step 1: Create dream
        const headers = getRequestHeaders({
          contentType: ContentType.json,
        });
        const { data: createData } = await axiosClient.post(
          "/v1/dream",
          {
            name,
            prompt: JSON.stringify(algoParams),
          },
          { headers },
        );
        const dreamUuid = createData?.data?.dream?.uuid;
        if (!dreamUuid) {
          throw new Error("No dream UUID returned from API");
        }

        // Step 2: Attach keyframes
        await axiosClient.put(
          `/v1/dream/${dreamUuid}`,
          {
            startKeyframe: fromKf.keyframeUuid,
            endKeyframe: toKf?.keyframeUuid,
          },
          { headers },
        );

        // Step 3: Store UUID and set status
        setTransitionDream(index, dreamUuid);
        updateTransitionStatus(index, "queue");
      } catch (error) {
        console.error("Failed to create transition dream:", error);
        updateTransitionStatus(index, "failed");
      }
    },
    [keyframes, globalSettings, setTransitionDream, updateTransitionStatus],
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
      // Read current transitions from store (fresh read)
      const currentTransitions = useFlowStore.getState().transitions;
      for (let i = 0; i < currentTransitions.length; i++) {
        const t = currentTransitions[i];
        // Skip already done or in-flight
        if (
          t.status === "processed" ||
          t.status === "processing" ||
          t.status === "queue"
        ) {
          continue;
        }
        await generateTransition(i, t);
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
