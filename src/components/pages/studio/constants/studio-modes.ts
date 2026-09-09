import type { StudioMode } from "@/types/flow.types";

/**
 * The studio apps, in the order the header toggle renders them.
 */
export const STUDIO_MODES: readonly StudioMode[] = [
  "flow",
  "action",
  "uprez",
] as const;

/**
 * Display names for the studio modes. Render through this map rather than
 * printing the mode value, so the label and the literal can't drift.
 */
export const STUDIO_MODE_LABELS: Record<StudioMode, string> = {
  flow: "Flow",
  action: "Action",
  uprez: "Uprez",
};
