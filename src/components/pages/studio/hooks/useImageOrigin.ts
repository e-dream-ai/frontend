import { useCallback } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useDream } from "@/api/dream/query/useDream";
import { useModels } from "@/api/model/query/useModels";
import { imageOriginFromDreamPrompt } from "../utils/image-prompt";

/**
 * How a frame was made, read from its dream: the prompt, a line of settings
 * to show under it, and `remix` to load all of that into the generate dialog.
 * `generated` is undefined for an upload, or while the dream is loading.
 */
export const useImageOrigin = (dreamUuid?: string) => {
  const { data, isLoading } = useDream(dreamUuid);
  const dream = data?.data?.dream;
  const origin = dream ? imageOriginFromDreamPrompt(dream.prompt) : undefined;
  const generated = origin?.kind === "generated" ? origin : undefined;
  const { data: modelsData } = useModels({ mediaType: "image" });

  const modelLabel = generated
    ? modelsData?.data?.models?.find((m) => m.id === generated.algorithm)
        ?.label ?? generated.algorithm
    : undefined;
  const settings = [
    modelLabel,
    generated?.size?.replace("*", "×"),
    generated?.seed !== undefined ? `seed ${generated.seed}` : undefined,
  ].filter((s): s is string => !!s);

  /** Loads the frame's prompt and settings into the generate dialog. */
  const remix = useCallback(() => {
    if (!generated) return;
    const store = useStudioStore.getState();
    store.setImagePrompt(generated.prompt);
    // Only a model the studio offers is carried over; otherwise the prompt
    // goes to whichever model the generate dialog already has.
    if (!generated.model) return;
    store.setImageGenParams({
      model: generated.model,
      ...(generated.size ? { size: generated.size } : {}),
      negativePrompt: generated.negativePrompt ?? "",
    });
    const reference = generated.styleReferenceUuid;
    if (reference) {
      store.setStyleReference({
        uuid: reference,
        name:
          store.images.find((i) => i.uuid === reference)?.name ??
          "Style reference",
      });
    }
  }, [generated]);

  return {
    loading: isLoading && !origin,
    generated,
    settings,
    remix,
  };
};
