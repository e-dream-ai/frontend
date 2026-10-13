import { useCallback, useMemo, useState } from "react";
import { useStudioStore, comboKeyOf } from "@/stores/studio.store";
import { useCreateDreamFromPrompt } from "@/api/dream/mutation/useCreateDreamFromPrompt";
import {
  clampDurationToAllowed,
  getAllowedDurationsForActions,
} from "../constants/duration-options";
import {
  guidanceForModel,
  resolveGuidanceConstraint,
} from "../constants/guidance-options";
import { useModelConstraints } from "@/api/model/query/useModelConstraints";
import { buildVideoAlgoParams } from "../utils/build-video-algo-params";
import {
  findCellJob,
  indexCellJobs,
  isAnimatableFrame,
  isCellChecked,
  isJobInFlight,
  isRunnableAction,
} from "../utils/batch-selectors";

// Serialized to avoid concurrent auth refresh races (see fix/session-refresh-race on backend)
const BATCH_SIZE = 1;

export const useBatchSubmit = () => {
  const images = useStudioStore((s) => s.images);
  const actions = useStudioStore((s) => s.actions);
  const videoGenParams = useStudioStore((s) => s.videoGenParams);
  const excludedCombos = useStudioStore((s) => s.excludedCombos);
  const rerenderCombos = useStudioStore((s) => s.rerenderCombos);
  const addJob = useStudioStore((s) => s.addJob);
  const setActiveTab = useStudioStore((s) => s.setActiveTab);
  const jobs = useStudioStore((s) => s.jobs);
  const cellJobs = useMemo(() => indexCellJobs(jobs), [jobs]);

  const createDream = useCreateDreamFromPrompt();
  const modelConstraints = useModelConstraints({ mediaType: "video" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPendingCombinations = useCallback(() => {
    const frames = images.filter(isAnimatableFrame);
    const runnableActions = actions.filter(isRunnableAction);

    const combos: Array<{
      image: (typeof frames)[0];
      action: (typeof runnableActions)[0];
    }> = [];

    for (const image of frames) {
      for (const action of runnableActions) {
        const comboKey = comboKeyOf(image.uuid, action.id);
        const job = cellJobs.get(comboKey);
        if (job && isJobInFlight(job)) continue;
        if (isCellChecked(job, comboKey, excludedCombos, rerenderCombos)) {
          combos.push({ image, action });
        }
      }
    }

    return combos;
  }, [images, actions, excludedCombos, rerenderCombos, cellJobs]);

  const submit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const combos = getPendingCombinations();
      const allowedDurations = getAllowedDurationsForActions(
        combos.map(({ action }) => action),
        modelConstraints.get(videoGenParams.model)?.durationsSec,
      );
      const duration = clampDurationToAllowed(
        videoGenParams.duration,
        allowedDurations,
      );
      const guidance = guidanceForModel(
        videoGenParams.guidance,
        resolveGuidanceConstraint(
          videoGenParams.model,
          modelConstraints.get(videoGenParams.model),
        ),
      );
      let jobsAdded = 0;

      for (let i = 0; i < combos.length; i += BATCH_SIZE) {
        const batch = combos.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
          batch.map(async ({ image, action }) => {
            const algoParams = buildVideoAlgoParams({
              model: videoGenParams.model,
              action,
              imageUuid: image.uuid,
              imageSize: image.size,
              duration,
              numInferenceSteps: videoGenParams.numInferenceSteps,
              guidance,
              seed: videoGenParams.seed,
            });

            const response = await createDream.mutateAsync({
              name: `${image.name} - ${action.prompt.slice(0, 40)}`,
              prompt: JSON.stringify(algoParams),
            });

            const dream = response.data?.dream;
            if (!dream) return;

            const existingJob = findCellJob(
              useStudioStore.getState().jobs,
              image.uuid,
              action.id,
            );
            if (existingJob) {
              // The re-render replaces it; it stays in history.
              useStudioStore.getState().archiveJob(existingJob.dreamUuid);
            }

            addJob({
              imageId: image.uuid,
              actionId: action.id,
              dreamUuid: dream.uuid,
              jobType: videoGenParams.model,
              settings: {
                model: videoGenParams.model,
                duration,
                numInferenceSteps: videoGenParams.numInferenceSteps,
                guidance,
                seed: videoGenParams.seed,
              },
              status:
                (dream.status as
                  | "queue"
                  | "processing"
                  | "processed"
                  | "failed") || "queue",
            });
            jobsAdded++;
          }),
        );

        for (const result of results) {
          if (result.status === "rejected") {
            console.error("Failed to create dream for combo:", result.reason);
          }
        }
      }

      if (jobsAdded > 0) {
        setActiveTab("generate");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    getPendingCombinations,
    videoGenParams,
    modelConstraints,
    createDream,
    addJob,
    setActiveTab,
  ]);

  return { submit, isSubmitting, getPendingCombinations };
};
