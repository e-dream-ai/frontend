import { useCallback, useRef, useState } from "react";
import Bugsnag from "@bugsnag/js";
import { toast } from "react-toastify";
import { useFlowStore } from "@/stores/flow.store";
import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";
import { buildVideoAlgoParams } from "@/components/pages/studio/utils/build-video-algo-params";
import { resolveEffectiveSettings } from "@/components/pages/studio/utils/resolve-flow-settings";
import type { FlowTransition, TransitionRunSettings } from "@/types/flow.types";
import queryClient from "@/api/query-client";
import { USER_QUERY_KEY } from "@/api/user/query/useUser";
import { ensureFlowKeyframe } from "@/components/pages/studio/utils/flow-keyframes";
import { resolveGenerationTargets } from "@/components/pages/studio/utils/flow-generation-targets";
import { isTransitionMismatched } from "@/components/pages/studio/utils/frame-aspect";

// Cap concurrent dream creations so "Generate All" doesn't fan out 50+ requests at once.
const GENERATE_CONCURRENCY = 4;

/** Worker-pool style concurrency cap over a list of transition targets. */
async function runWithConcurrency(
  targets: ReadonlyArray<{ index: number; transition: FlowTransition }>,
  run: (index: number, transition: FlowTransition) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const worker = async () => {
    while (cursor < targets.length) {
      const next = targets[cursor++];
      await run(next.index, next.transition);
    }
  };
  await Promise.all(
    Array.from(
      { length: Math.min(GENERATE_CONCURRENCY, targets.length) },
      worker,
    ),
  );
}

export function useFlowGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const generatingCount = useRef(0);

  // Actions are stable refs — subscribe individually, not via useShallow.
  const recordTransitionRun = useFlowStore((s) => s.recordTransitionRun);
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
        globalSeed: store.globalSeed,
        globalLora: store.globalLora,
      });

      const fromKf = store.referenceFrames.find(
        (frame) => frame.id === transition.fromFrameId,
      );
      if (!fromKf) {
        Bugsnag.notify(
          new Error(`Reference frame not found: ${transition.fromFrameId}`),
        );
        updateTransitionStatus(index, "failed");
        return;
      }

      const imageRef = fromKf.dreamUuid || fromKf.imageUrl;

      const toKf = store.referenceFrames.find(
        (frame) => frame.id === transition.toFrameId,
      );
      if (!toKf) {
        Bugsnag.notify(
          new Error(`Reference frame not found: ${transition.toFrameId}`),
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
        seed: settings.seed,
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

        // Snapshot the *resolved* settings, not the overrides: this is what
        // lets the history strip restore this take later, after the globals
        // it fell back to have moved on.
        const runSettings: TransitionRunSettings = {
          presetOverride: settings.presetId,
          promptOverride: settings.prompt,
          negativePromptOverride: settings.negativePrompt,
          durationOverride: settings.duration,
          modelOverride: settings.model,
          numInferenceStepsOverride: settings.numInferenceSteps,
          guidanceOverride: settings.guidance,
          seedOverride: settings.seed,
          loraOverride: settings.action.highNoiseLoras ?? [],
        };
        recordTransitionRun(index, dreamUuid, runSettings, Date.now());
        updateTransitionStatus(index, "queue");
      } catch (error) {
        Bugsnag.notify(error as Error);
        updateTransitionStatus(index, "failed");
      }
    },
    [recordTransitionRun, updateTransitionStatus],
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
      const { transitions, referenceFrames } = useFlowStore.getState();
      const { targets, skippedForMismatch } = resolveGenerationTargets(
        transitions,
        referenceFrames,
      );

      if (skippedForMismatch > 0) {
        toast.info(
          `Skipped ${skippedForMismatch} transition${
            skippedForMismatch === 1 ? "" : "s"
          } with mismatched aspect ratios. Open one to generate it anyway.`,
        );
      }

      await runWithConcurrency(targets, generateTransition);
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

  /**
   * Regenerate an explicit selection. Unlike Generate All this does not skip
   * already-processed transitions — asking for a rerun of the ones you picked
   * is the whole point — but it still refuses aspect-ratio mismatches, which
   * would only fail the same way they did before.
   */
  const generateMany = useCallback(
    async (indices: readonly number[]) => {
      startGenerating();
      try {
        const { transitions, referenceFrames } = useFlowStore.getState();
        const byId = new Map(referenceFrames.map((frame) => [frame.id, frame]));
        const targets: Array<{ index: number; transition: FlowTransition }> =
          [];
        let skippedForMismatch = 0;

        for (const index of indices) {
          const transition = transitions[index];
          if (!transition) continue;
          if (
            isTransitionMismatched(
              byId.get(transition.fromFrameId),
              byId.get(transition.toFrameId),
            )
          ) {
            skippedForMismatch += 1;
            continue;
          }
          targets.push({ index, transition });
        }

        if (skippedForMismatch > 0) {
          toast.info(
            `Skipped ${skippedForMismatch} transition${
              skippedForMismatch === 1 ? "" : "s"
            } with mismatched aspect ratios.`,
          );
        }

        await runWithConcurrency(targets, generateTransition);
        if (targets.length > 0) {
          await queryClient.invalidateQueries([USER_QUERY_KEY]);
        }
      } finally {
        stopGenerating();
      }
    },
    [generateTransition, startGenerating, stopGenerating],
  );

  return { generateAll, generateOne, generateMany, isGenerating };
}
