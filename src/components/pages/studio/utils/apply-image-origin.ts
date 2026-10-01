import { useStudioStore } from "@/stores/studio.store";
import type { GeneratedImageOrigin } from "./image-prompt";

export const applyImageOrigin = (generated: GeneratedImageOrigin) => {
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
};
