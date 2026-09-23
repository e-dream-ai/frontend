import { useCallback, useState } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useCreateDreamFromPrompt } from "@/api/dream/mutation/useCreateDreamFromPrompt";
import { axiosClient } from "@/client/axios.client";
import { createComboKey } from "@/types/studio.types";
import type { StudioJob } from "@/types/studio.types";
import { useModelConstraints } from "@/api/model/query/useModelConstraints";
import {
  clampDurationToAllowed,
  getAllowedDurationsForActions,
} from "../constants/duration-options";
import {
  guidanceForModel,
  resolveGuidanceConstraint,
} from "../constants/guidance-options";
import { buildVideoAlgoParams } from "../utils/build-video-algo-params";

const BATCH_SIZE = 5;

/**
 * Resubmits every failed video job, each on the model it originally ran with
 * rather than whatever is selected now. Lifted out of the Results tab when the
 * combination grid absorbed it.
 */
export function useRetryFailedJobs() {
  const images = useStudioStore((s) => s.images);
  const actions = useStudioStore((s) => s.actions);
  const jobs = useStudioStore((s) => s.jobs);
  const addJob = useStudioStore((s) => s.addJob);
  const removeJob = useStudioStore((s) => s.removeJob);
  const outputPlaylistId = useStudioStore((s) => s.outputPlaylistId);
  const videoGenParams = useStudioStore((s) => s.videoGenParams);
  const modelConstraints = useModelConstraints({ mediaType: "video" });
  const createDream = useCreateDreamFromPrompt();

  const [isRetrying, setIsRetrying] = useState(false);

  const failedCount = jobs.filter(
    (j) => j.status === "failed" && j.jobType !== "uprez",
  ).length;

  const retryFailed = useCallback(async () => {
    // Only retry video generation jobs (uprez retries not yet supported)
    const failedJobs = jobs.filter(
      (j) => j.status === "failed" && j.jobType !== "uprez",
    );
    if (failedJobs.length === 0) return;

    const failedActionIds = new Set(failedJobs.map((j) => j.actionId));
    const allowedDurations = getAllowedDurationsForActions(
      actions.filter((action) => failedActionIds.has(action.id)),
      modelConstraints.get(videoGenParams.model)?.durationsSec,
    );
    const duration = clampDurationToAllowed(
      videoGenParams.duration,
      allowedDurations,
    );
    // Same validation the initial submit does. Guidance is unset until the
    // catalog resolves it, and an unset value must not reach the API.
    const guidance = guidanceForModel(
      videoGenParams.guidance,
      resolveGuidanceConstraint(
        videoGenParams.model,
        modelConstraints.get(videoGenParams.model),
      ),
    );

    setIsRetrying(true);
    try {
      for (let i = 0; i < failedJobs.length; i += BATCH_SIZE) {
        const batch = failedJobs.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
          batch.map(async (job) => {
            const image = images.find((img) => img.uuid === job.imageId);
            const action = actions.find((a) => a.id === job.actionId);
            if (!image || !action) return;

            // Use the original job's model for retry, not the current selection
            const retryModel =
              job.jobType === "wan-i2v" || job.jobType === "ltx-i2v"
                ? job.jobType
                : videoGenParams.model;

            const batchIdentifier = createComboKey(image.uuid, action.prompt);

            const algoParams = buildVideoAlgoParams({
              model: retryModel,
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
              description: `Studio batch retry. BATCH_IDENTIFIER:${batchIdentifier}`,
            });

            const dream = response.data?.dream;
            if (!dream) return;

            removeJob(job.dreamUuid);
            addJob({
              imageId: job.imageId,
              actionId: job.actionId,
              dreamUuid: dream.uuid,
              jobType: retryModel,
              status: (dream.status as StudioJob["status"]) || "queue",
            });

            if (outputPlaylistId) {
              await axiosClient.put(
                `/v1/playlist/${outputPlaylistId}/add-item`,
                {
                  type: "dream",
                  uuid: dream.uuid,
                },
              );
            }
          }),
        );

        for (const result of results) {
          if (result.status === "rejected") {
            console.error("Failed to retry job:", result.reason);
          }
        }
      }
    } finally {
      setIsRetrying(false);
    }
  }, [
    jobs,
    images,
    actions,
    videoGenParams,
    modelConstraints,
    createDream,
    removeJob,
    addJob,
    outputPlaylistId,
  ]);

  return { retryFailed, isRetrying, failedCount };
}
