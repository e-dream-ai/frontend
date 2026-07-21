import { useCallback, useRef, useState } from "react";
import Bugsnag from "@bugsnag/js";
import { useFlowStore } from "@/stores/flow.store";
import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";
import { buildVideoAlgoParams } from "@/components/pages/studio/utils/build-video-algo-params";
import { resolveEffectiveSettings } from "@/components/pages/studio/utils/resolve-flow-settings";
import type { FlowTransition } from "@/types/flow.types";
import queryClient from "@/api/query-client";
import { USER_QUERY_KEY } from "@/api/user/query/useUser";
import { ensureFlowKeyframe } from "@/components/pages/studio/utils/flow-keyframes";

// Cap concurrent dream creations so "Generate All" doesn't fan out 50+ requests at once.
const GENERATE_CONCURRENCY = 4;

export function useFlowGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const generatingCount = useRef(0);

  // Actions are stable refs — subscribe individually, not via useShallow.
  const setTransitionDream = useFlowStore((s) => s.setTransitionDream);
  const updateTransitionStatus = useFlowStore((s) => s.updateTransitionStatus);

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

      const imageRef = fromKf.dreamUuid || fromKf.imageUrl;

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
      const endImageRef = toKf.dreamUuid || toKf.imageUrl;

      const algoParams = buildVideoAlgoParams({
        model: settings.model,
        action: settings.action,
        imageUuid: imageRef,
        endImageUuid: endImageRef,
        imageSize: undefined,
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
    [setTransitionDream, updateTransitionStatus],
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
