import { useCallback, useState } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useCreateDreamFromPrompt } from "@/api/dream/mutation/useCreateDreamFromPrompt";
import { axiosClient } from "@/client/axios.client";
import { createComboKey } from "@/types/studio.types";
import {
  clampDurationToAllowed,
  getAllowedDurationsForActions,
} from "../constants/duration-options";
import { buildVideoAlgoParams } from "../utils/build-video-algo-params";

// Serialized to avoid concurrent auth refresh races (see fix/session-refresh-race on backend)
const BATCH_SIZE = 1;

export const useBatchSubmit = () => {
  const images = useStudioStore((s) => s.images);
  const actions = useStudioStore((s) => s.actions);
  const videoGenParams = useStudioStore((s) => s.videoGenParams);
  const excludedCombos = useStudioStore((s) => s.excludedCombos);
  const outputPlaylistId = useStudioStore((s) => s.outputPlaylistId);
  const setOutputPlaylistId = useStudioStore((s) => s.setOutputPlaylistId);
  const addJob = useStudioStore((s) => s.addJob);
  const setActiveTab = useStudioStore((s) => s.setActiveTab);
  const jobs = useStudioStore((s) => s.jobs);

  const createDream = useCreateDreamFromPrompt();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getSelectedCombinations = useCallback(() => {
    const selectedImages = images.filter(
      (img) => img.selected && img.status === "processed",
    );
    const enabledActions = actions.filter((a) => a.enabled && a.prompt.trim());

    const existingJobKeys = new Set(
      jobs.map((j) => `${j.imageId}:${j.actionId}`),
    );

    const combos: Array<{
      image: (typeof selectedImages)[0];
      action: (typeof enabledActions)[0];
    }> = [];

    for (const image of selectedImages) {
      for (const action of enabledActions) {
        const comboKey = `${image.uuid}:${action.id}`;
        if (!excludedCombos.has(comboKey) && !existingJobKeys.has(comboKey)) {
          combos.push({ image, action });
        }
      }
    }

    return combos;
  }, [images, actions, excludedCombos, jobs]);

  const submit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      let playlistId = outputPlaylistId;
      if (!playlistId) {
        const now = new Date();
        const name = `Studio ${now
          .toISOString()
          .slice(0, 16)
          .replace("T", " ")}`;
        const { data } = await axiosClient.post("/v1/playlist", { name });
        playlistId = data.data.playlist.uuid;
        setOutputPlaylistId(playlistId);
      }

      const combos = getSelectedCombinations();
      const allowedDurations = getAllowedDurationsForActions(
        combos.map(({ action }) => action),
        videoGenParams.model,
      );
      const duration = clampDurationToAllowed(
        videoGenParams.duration,
        allowedDurations,
      );
      let jobsAdded = 0;

      for (let i = 0; i < combos.length; i += BATCH_SIZE) {
        const batch = combos.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
          batch.map(async ({ image, action }) => {
            const batchIdentifier = createComboKey(image.uuid, action.prompt);

            const algoParams = buildVideoAlgoParams({
              model: videoGenParams.model,
              action,
              imageUuid: image.uuid,
              imageSize: image.size,
              duration,
              numInferenceSteps: videoGenParams.numInferenceSteps,
              guidance: videoGenParams.guidance,
            });

            const response = await createDream.mutateAsync({
              name: `${image.name} - ${action.prompt.slice(0, 40)}`,
              prompt: JSON.stringify(algoParams),
              description: `Studio batch. BATCH_IDENTIFIER:${batchIdentifier}`,
            });

            const dream = response.data?.dream;
            if (!dream) return;

            addJob({
              imageId: image.uuid,
              actionId: action.id,
              dreamUuid: dream.uuid,
              jobType: videoGenParams.model,
              status:
                (dream.status as
                  | "queue"
                  | "processing"
                  | "processed"
                  | "failed") || "queue",
              selectedForUprez: false,
            });
            jobsAdded++;

            await axiosClient.put(`/v1/playlist/${playlistId}/add-item`, {
              type: "dream",
              uuid: dream.uuid,
            });
          }),
        );

        for (const result of results) {
          if (result.status === "rejected") {
            console.error("Failed to create dream for combo:", result.reason);
          }
        }
      }

      if (jobsAdded > 0) {
        setActiveTab("results");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    outputPlaylistId,
    setOutputPlaylistId,
    getSelectedCombinations,
    videoGenParams,
    createDream,
    addJob,
    setActiveTab,
  ]);

  return { submit, isSubmitting, getSelectedCombinations };
};
