import type { StudioAction } from "@/types/studio.types";
import type { VideoModel } from "@/types/studio.types";

type ActionWithLoras = Pick<StudioAction, "highNoiseLoras" | "lowNoiseLoras">;

export const DURATION_OPTIONS_LORA = [5, 8] as const;
export const DURATION_OPTIONS_DEFAULT = [5, 8, 10] as const;
export const DURATION_OPTIONS_LTX = [5, 10, 15, 20] as const;

export const hasActionLoras = (action: ActionWithLoras): boolean =>
  (action.highNoiseLoras?.length ?? 0) > 0 ||
  (action.lowNoiseLoras?.length ?? 0) > 0;

export const getAllowedDurationsForActions = (
  actions: ActionWithLoras[],
  model: VideoModel = "wan-i2v",
): number[] => {
  if (model === "ltx-i2v") {
    return [...DURATION_OPTIONS_LTX];
  }

  if (actions.length === 0) {
    return [...DURATION_OPTIONS_DEFAULT];
  }

  return DURATION_OPTIONS_DEFAULT.filter((duration) =>
    actions.every((action) => {
      const actionDurations: readonly number[] = hasActionLoras(action)
        ? DURATION_OPTIONS_LORA
        : DURATION_OPTIONS_DEFAULT;
      return actionDurations.includes(duration);
    }),
  );
};

export const clampDurationToAllowed = (
  duration: number,
  allowedDurations: number[],
): number => {
  if (allowedDurations.includes(duration)) {
    return duration;
  }

  return allowedDurations[0] ?? DURATION_OPTIONS_DEFAULT[0];
};
