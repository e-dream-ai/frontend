import type {
  StudioJob,
  VideoGenParams,
  VideoModel,
} from "@/types/studio.types";
import { GUIDANCE_PARAM } from "../constants/guidance-options";

/** What a clip was made with. Only `model` is certain for an old job. */
export type JobSettings = Partial<VideoGenParams> & { model: VideoModel };

type SettingField = Exclude<keyof VideoGenParams, "model">;

/**
 * The settings that actually reach each model. Wan has no guidance and takes
 * no seed from us; LTX and Kling fix their own step schedule. Two clips that
 * differ only in a field their model ignores were made the same way.
 */
export const SETTING_FIELDS: Record<VideoModel, readonly SettingField[]> = {
  "ltx-i2v": ["duration", "guidance", "seed"],
  "wan-i2v": ["duration", "numInferenceSteps"],
  "kling-i2v": ["duration", "guidance"],
  "kling-25-i2v": ["duration", "guidance"],
};

const ALGORITHM_MODELS: Record<string, VideoModel> = {
  "ltx-i2v": "ltx-i2v",
  "wan-i2v": "wan-i2v",
  "wan-i2v-lora": "wan-i2v",
  "kling-i2v": "kling-i2v",
  "kling-25-i2v": "kling-25-i2v",
};

const asNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

/**
 * Reads the settings back out of the algorithm params a dream was submitted
 * with — its `prompt` — for jobs made before the studio recorded them.
 */
export const settingsFromDreamPrompt = (
  prompt: unknown,
): JobSettings | undefined => {
  let params: unknown = prompt;
  if (typeof prompt === "string") {
    try {
      params = JSON.parse(prompt);
    } catch {
      return undefined;
    }
  }
  if (!params || typeof params !== "object") return undefined;
  const p = params as Record<string, unknown>;
  const model = ALGORITHM_MODELS[String(p.infinidream_algorithm)];
  if (!model) return undefined;

  const settings: JobSettings = { model };
  const duration = asNumber(p.duration);
  if (duration !== undefined) settings.duration = duration;
  const steps = asNumber(p.num_inference_steps);
  if (steps !== undefined) settings.numInferenceSteps = steps;
  const guidanceKey = GUIDANCE_PARAM[model];
  const guidance = guidanceKey ? asNumber(p[guidanceKey]) : undefined;
  if (guidance !== undefined) settings.guidance = guidance;
  const seed = asNumber(p.seed);
  if (seed !== undefined) settings.seed = seed;
  return settings;
};

/** Best knowledge of a job's settings: recorded, else read from its dream. */
export const resolveJobSettings = (
  job: StudioJob,
  dreamPrompt?: unknown,
): JobSettings | undefined => {
  if (job.jobType === "uprez") return undefined;
  return (
    job.settings ??
    settingsFromDreamPrompt(dreamPrompt) ?? { model: job.jobType }
  );
};

/**
 * Whether a clip was made differently from `panel`. Only fields the clip's
 * model uses count, and a field the clip has no record of cannot disagree.
 */
export const settingsDiffer = (
  clip: JobSettings,
  panel: VideoGenParams,
): boolean => {
  if (clip.model !== panel.model) return true;
  return SETTING_FIELDS[clip.model].some((field) => {
    const value = clip[field];
    return value !== undefined && value !== panel[field];
  });
};

/** The panel fields to load so it shows how a clip was made. */
export const settingsPatch = (clip: JobSettings): Partial<VideoGenParams> => {
  const patch: Partial<VideoGenParams> = { model: clip.model };
  for (const field of SETTING_FIELDS[clip.model]) {
    const value = clip[field];
    if (value !== undefined) patch[field] = value;
  }
  return patch;
};
