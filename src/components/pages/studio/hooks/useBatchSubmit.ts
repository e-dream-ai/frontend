import { useCallback, useState } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useCreateDreamFromPrompt } from "@/api/dream/mutation/useCreateDreamFromPrompt";
import { axiosClient } from "@/client/axios.client";
import { createComboKey } from "@/types/studio.types";

export const useBatchSubmit = () => {
  const images = useStudioStore((s) => s.images);
  const actions = useStudioStore((s) => s.actions);
  const wanParams = useStudioStore((s) => s.wanParams);
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

    const combos: Array<{
      image: (typeof selectedImages)[0];
      action: (typeof enabledActions)[0];
    }> = [];

    for (const image of selectedImages) {
      for (const action of enabledActions) {
        const comboKey = `${image.uuid}:${action.id}`;
        if (!excludedCombos.has(comboKey)) {
          const existingJob = jobs.find(
            (j) => j.imageId === image.uuid && j.actionId === action.id,
          );
          if (!existingJob) {
            combos.push({ image, action });
          }
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
      let jobsAdded = 0;

      for (const { image, action } of combos) {
        const batchIdentifier = createComboKey(image.uuid, action.prompt);
        const hasLoras =
          (action.highNoiseLoras && action.highNoiseLoras.length > 0) ||
          (action.lowNoiseLoras && action.lowNoiseLoras.length > 0);

        const algoParams = hasLoras
          ? {
              infinidream_algorithm: "wan-i2v-lora" as const,
              prompt: action.prompt,
              image: image.uuid,
              duration: wanParams.duration,
              num_inference_steps: wanParams.numInferenceSteps,
              guidance: wanParams.guidance,
              seed: -1,
              high_noise_loras: action.highNoiseLoras ?? [],
              low_noise_loras: action.lowNoiseLoras ?? [],
            }
          : {
              infinidream_algorithm: "wan-i2v" as const,
              prompt: action.prompt,
              image: image.uuid,
              size: image.size || "1280*720",
              duration: wanParams.duration,
              num_inference_steps: wanParams.numInferenceSteps,
              guidance: wanParams.guidance,
            };

        try {
          const response = await createDream.mutateAsync({
            name: `${image.name} - ${action.prompt.slice(0, 40)}`,
            prompt: JSON.stringify(algoParams),
            description: `Studio batch. BATCH_IDENTIFIER:${batchIdentifier}`,
          });

          const dream = response.data?.dream;
          if (!dream) continue;

          addJob({
            imageId: image.uuid,
            actionId: action.id,
            dreamUuid: dream.uuid,
            jobType: "wan-i2v",
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
        } catch (err) {
          console.error(
            "Failed to create dream for combo:",
            batchIdentifier,
            err,
          );
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
    wanParams,
    createDream,
    addJob,
    setActiveTab,
  ]);

  return { submit, isSubmitting, getSelectedCombinations };
};
