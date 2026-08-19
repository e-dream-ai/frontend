import type { GuidanceConstraint, ModelConstraints } from "@/types/model.types";
import type { VideoModel } from "@/types/studio.types";

export const GUIDANCE_PARAM: Partial<
  Record<VideoModel, "guidance" | "cfg_scale">
> = {
  "ltx-i2v": "guidance",
  "kling-i2v": "cfg_scale",
  "kling-25-i2v": "cfg_scale",
};

export const resolveGuidanceConstraint = (
  model: VideoModel,
  constraints?: ModelConstraints,
): GuidanceConstraint | undefined =>
  model in GUIDANCE_PARAM ? constraints?.guidance : undefined;

export const clampGuidance = (
  guidance: number,
  constraint: GuidanceConstraint | undefined,
): number => {
  if (!constraint) return guidance;
  const { min, max, step } = constraint;
  if (!Number.isFinite(guidance)) return constraint.default;
  const clamped = Math.min(max, Math.max(min, guidance));
  const snapped = min + Math.round((clamped - min) / step) * step;
  return roundToStep(Math.min(max, snapped));
};

export const guidanceForModel = (
  guidance: number,
  constraint: GuidanceConstraint | undefined,
): number => {
  if (!constraint) return guidance;
  if (!Number.isFinite(guidance)) return constraint.default;
  if (guidance < constraint.min || guidance > constraint.max) {
    return constraint.default;
  }
  return clampGuidance(guidance, constraint);
};

export const GUIDANCE_TITLE = "Classifier-Free Guidance Scale";

export const STEPS_PARAM = "num_inference_steps";
export const STEPS_TITLE = "Inference Steps";

export const formatGuidance = (
  guidance: number,
  constraint: GuidanceConstraint,
): string => {
  const decimals = constraint.step < 0.1 ? 2 : constraint.step < 1 ? 1 : 0;
  return guidance.toFixed(decimals);
};

export const guidanceStepCount = (constraint: GuidanceConstraint): number =>
  Math.max(1, Math.round((constraint.max - constraint.min) / constraint.step));

export const guidanceFillPercent = (
  guidance: number,
  constraint: GuidanceConstraint,
): number => {
  const span = constraint.max - constraint.min;
  if (span <= 0) return 100;
  const clamped = clampGuidance(guidance, constraint);
  return ((clamped - constraint.min) / span) * 100;
};

export const guidanceOptions = (constraint: GuidanceConstraint): number[] => {
  const { min, max, step } = constraint;
  const options: number[] = [];
  for (let value = min; value <= max + step / 2; value += step) {
    options.push(roundToStep(Math.min(value, max)));
  }
  return options;
};

const roundToStep = (value: number): number => Math.round(value * 100) / 100;
