import type { StudioAction, StudioImage } from "@/types/studio.types";

export const isAnimatableFrame = (image: StudioImage) =>
  image.status === "processed";

export const isRunnableAction = (action: StudioAction) =>
  action.prompt.trim().length > 0;
