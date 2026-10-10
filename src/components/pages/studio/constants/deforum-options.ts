import type { DeforumSettings } from "@/types/deforum.types";

/** A test render squeezes the whole timeline into this many frames. */
export const DEFORUM_TEST_FRAMES = 50;

export const DEFORUM_FRAME_PRESETS = [120, 300, 600, 1200, 3000] as const;

export const DEFORUM_SIZES = [
  { label: "16:9 — 1344×768", width: 1344, height: 768 },
  { label: "16:9 — 1024×576", width: 1024, height: 576 },
  { label: "9:16 — 768×1344", width: 768, height: 1344 },
  { label: "1:1 — 1024×1024", width: 1024, height: 1024 },
  { label: "1:1 — 768×768", width: 768, height: 768 },
] as const;

// ComfyUI sampler/scheduler names — the deforum container runs on ComfyUI.
export const DEFORUM_SAMPLERS = [
  "euler",
  "euler_ancestral",
  "dpmpp_2m",
  "dpmpp_2m_sde_gpu",
  "dpmpp_sde",
  "ddim",
  "lms",
] as const;

export const DEFORUM_SCHEDULERS = [
  "normal",
  "karras",
  "exponential",
  "sgm_uniform",
  "simple",
] as const;

/** The schedule fields, in panel order, with the deforum key each one sends. */
export const DEFORUM_SCHEDULE_FIELDS = [
  { field: "zoom", param: "zoom", label: "Zoom" },
  { field: "angle", param: "angle", label: "Angle" },
  { field: "translationX", param: "translation_x", label: "Translation X" },
  { field: "translationY", param: "translation_y", label: "Translation Y" },
  { field: "translationZ", param: "translation_z", label: "Translation Z" },
  { field: "rotation3dX", param: "rotation_3d_x", label: "Rotation 3D X" },
  { field: "rotation3dY", param: "rotation_3d_y", label: "Rotation 3D Y" },
  { field: "rotation3dZ", param: "rotation_3d_z", label: "Rotation 3D Z" },
  { field: "strengthSchedule", param: "strength_schedule", label: "Strength" },
  {
    field: "cfgScaleSchedule",
    param: "cfg_scale_schedule",
    label: "CFG scale",
  },
] as const satisfies ReadonlyArray<{
  field: keyof DeforumSettings;
  param: string;
  label: string;
}>;

export type DeforumScheduleField =
  (typeof DEFORUM_SCHEDULE_FIELDS)[number]["field"];

/** A seed for a new clip — fixed, so its test and final render agree. */
export const randomDeforumSeed = (): number =>
  Math.floor(Math.random() * 2 ** 31);

export const DEFAULT_DEFORUM_SETTINGS: Omit<
  DeforumSettings,
  "prompts" | "seed"
> = {
  negativePrompt: "nsfw, nude",
  maxFrames: 300,
  width: 1344,
  height: 768,
  steps: 25,
  sampler: "euler_ancestral",
  scheduler: "normal",
  animationMode: "3D",
  border: "replicate",
  zoom: "0: (1.025)",
  angle: "0: (0)",
  translationX: "0: (0)",
  translationY: "0: (0)",
  translationZ: "0: (0)",
  rotation3dX: "0: (0)",
  rotation3dY: "0: (0)",
  rotation3dZ: "0: (0)",
  strengthSchedule: "0: (0.6)",
  cfgScaleSchedule: "0: (7)",
};
