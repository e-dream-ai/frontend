import { useCallback } from "react";
import { useDream } from "@/api/dream/query/useDream";
import { useModels } from "@/api/model/query/useModels";
import {
  imageOriginFromDreamPrompt,
  imageSettings,
} from "../utils/image-prompt";
import { applyImageOrigin } from "../utils/apply-image-origin";

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

  const settings = generated
    ? imageSettings(
        generated,
        modelsData?.data?.models?.find((m) => m.id === generated.algorithm)
          ?.label ?? generated.algorithm,
      )
    : [];

  /** Loads the frame's prompt and settings into the generate dialog. */
  const remix = useCallback(() => {
    if (generated) applyImageOrigin(generated);
  }, [generated]);

  return {
    loading: isLoading && !origin,
    generated,
    settings,
    remix,
  };
};
