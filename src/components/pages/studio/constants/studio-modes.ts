import type { StudioMode } from "@/types/flow.types";

/**
 * The studio apps, in the order the header toggle renders them.
 */
export const STUDIO_MODES: readonly StudioMode[] = [
  "flow",
  "action",
  "enhance",
  "deforum",
] as const;

/**
 * Display names for the studio modes. Render through this map rather than
 * printing the mode value, so the label and the literal can't drift.
 */
export const STUDIO_MODE_LABELS: Record<StudioMode, string> = {
  flow: "Flow",
  action: "Action",
  enhance: "Enhance",
  deforum: "Deforum",
};

export const isStudioMode = (value?: string): value is StudioMode =>
  STUDIO_MODES.includes(value as StudioMode);

export const STUDIO_MODE_DESCRIPTIONS: Record<StudioMode, string> = {
  flow: "Animate transitions between reference frames",
  action: "Generate images and turn them into clips",
  enhance: "Upscale every dream in a playlist",
  deforum: "Animate prompt keyframes with deforum",
};
