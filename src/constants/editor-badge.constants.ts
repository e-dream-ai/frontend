import { FLOW } from "@/constants/flow-theme.constants";
import type { StudioMode } from "@/types/flow.types";

export const EDITOR_BADGE: Record<StudioMode, string> = {
  flow: FLOW.accent,
  action: FLOW.processing,
  uprez: FLOW.success,
};
