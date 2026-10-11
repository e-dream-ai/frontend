import type {
  DeforumAnimationMode,
  DeforumRenderKind,
  DeforumSettings,
} from "@/types/deforum.types";
import {
  DEFORUM_SCHEDULE_FIELDS,
  DEFORUM_TEST_FRAMES,
} from "../constants/deforum-options";

type DeforumScheduleParam = (typeof DEFORUM_SCHEDULE_FIELDS)[number]["param"];

export interface DeforumAlgoParams
  extends Record<DeforumScheduleParam, string> {
  infinidream_algorithm: "deforum";
  width: number;
  height: number;
  seed: number;
  steps: number;
  sampler_name: string;
  scheduler: string;
  prompts: Record<string, string>;
  animation_prompts_positive: string;
  animation_prompts_negative: string;
  animation_mode: DeforumAnimationMode;
  max_frames: number;
  fps: number;
  border: DeforumSettings["border"];
}

/**
 * Map a frame of a `fromFrames`-long timeline onto a `toFrames`-long one. The
 * ends are pinned — frame 0 stays 0 and the last frame stays last — so a prompt
 * placed on the final frame of the full render is still on it in the test.
 */
export const scaleFrame = (
  frame: number,
  fromFrames: number,
  toFrames: number,
): number => {
  if (fromFrames <= 1) return 0;
  const scaled = Math.round((frame * (toFrames - 1)) / (fromFrames - 1));
  return Math.min(Math.max(scaled, 0), toFrames - 1);
};

/**
 * Give each frame its own slot after scaling, in order. Squeezing 3000 frames
 * into 50 can land two keyframes on one frame; nudging the later one forward
 * keeps every prompt in the test instead of silently dropping one. When the
 * timeline is full there is nowhere to nudge to, and the later one wins.
 */
const spreadFrames = (frames: number[], maxFrame: number): number[] => {
  const out: number[] = [];
  for (const frame of frames) {
    const prev = out[out.length - 1];
    out.push(
      prev !== undefined && frame <= prev
        ? Math.min(prev + 1, maxFrame)
        : frame,
    );
  }
  return out;
};

type ScheduleEntry = { raw: string; frame?: number; value?: string };

/** Split a schedule on its top-level commas — values can hold `f(a, b)`. */
const splitSchedule = (schedule: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let quoted = false;
  let start = 0;
  for (let i = 0; i < schedule.length; i++) {
    const ch = schedule[i];
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch === "(") depth++;
    else if (!quoted && ch === ")") depth--;
    else if (!quoted && depth === 0 && ch === ",") {
      parts.push(schedule.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(schedule.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
};

/**
 * Rescale the frame keys of a deforum schedule (`"0: (1.0), 200: (1.8)"`).
 * Only plain integer keys move; a quoted expression key like `"max_f-2"` is
 * already relative to the length and is left alone, as is anything this can't
 * parse. Values are never touched — an expression in `t` still counts frames
 * of the shorter render.
 */
export const scaleSchedule = (
  schedule: string,
  fromFrames: number,
  toFrames: number,
): string => {
  const entries: ScheduleEntry[] = splitSchedule(schedule).map((raw) => {
    const match = /^(\d+)\s*:\s*([\s\S]*)$/.exec(raw);
    return match ? { raw, frame: Number(match[1]), value: match[2] } : { raw };
  });
  const keyed = entries
    .filter((e): e is Required<ScheduleEntry> => e.frame !== undefined)
    .sort((a, b) => a.frame - b.frame);
  const spread = spreadFrames(
    keyed.map((e) => scaleFrame(e.frame, fromFrames, toFrames)),
    toFrames - 1,
  );
  const scaled = new Map<ScheduleEntry, number>(
    keyed.map((e, i) => [e, spread[i]]),
  );
  return entries
    .map((e) => {
      const frame = scaled.get(e);
      return frame === undefined ? e.raw : `${frame}: ${e.value}`;
    })
    .join(", ");
};

/** Prompts in frame order, blanks dropped, as deforum's `{frame: text}` map. */
export const promptMap = (
  settings: Pick<DeforumSettings, "prompts" | "maxFrames">,
  toFrames: number = settings.maxFrames,
): Record<string, string> => {
  const sorted = settings.prompts
    .filter((p) => p.text.trim())
    .slice()
    .sort((a, b) => a.frame - b.frame);
  // The first prompt always starts the animation, whatever frame it carries.
  const frames = spreadFrames(
    sorted.map((p, i) =>
      i === 0 ? 0 : scaleFrame(p.frame, settings.maxFrames, toFrames),
    ),
    toFrames - 1,
  );
  const map: Record<string, string> = {};
  sorted.forEach((p, i) => {
    map[String(frames[i])] = p.text.trim();
  });
  return map;
};

/** Frame count a render of this kind actually produces. */
export const renderFrames = (
  settings: Pick<DeforumSettings, "maxFrames">,
  kind: DeforumRenderKind,
): number =>
  kind === "test"
    ? Math.min(DEFORUM_TEST_FRAMES, settings.maxFrames)
    : settings.maxFrames;

/**
 * The dream prompt for a deforum render. A test keeps every setting but
 * squeezes the timeline — prompt and schedule keyframes alike — into
 * DEFORUM_TEST_FRAMES by one scale factor, so it previews the whole arc.
 */
export const buildDeforumAlgoParams = (
  settings: DeforumSettings,
  kind: DeforumRenderKind,
): DeforumAlgoParams => {
  const frames = renderFrames(settings, kind);
  const scale = (schedule: string) =>
    frames === settings.maxFrames
      ? schedule
      : scaleSchedule(schedule, settings.maxFrames, frames);
  const schedules = Object.fromEntries(
    DEFORUM_SCHEDULE_FIELDS.map(({ field, param }) => [
      param,
      scale(settings[field]),
    ]),
  ) as Record<DeforumScheduleParam, string>;

  return {
    infinidream_algorithm: "deforum",
    width: settings.width,
    height: settings.height,
    seed: settings.seed,
    steps: settings.steps,
    sampler_name: settings.sampler,
    scheduler: settings.scheduler,
    prompts: promptMap(settings, frames),
    animation_prompts_positive: "",
    animation_prompts_negative: settings.negativePrompt.trim(),
    animation_mode: settings.animationMode,
    max_frames: frames,
    fps: settings.fps,
    border: settings.border,
    ...schedules,
  };
};

/** Settings compared by value — to tell when a clip has moved past a render. */
export const deforumSettingsKey = (settings: DeforumSettings): string =>
  JSON.stringify(
    Object.entries({
      ...settings,
      prompts: settings.prompts.map(({ frame, text }) => [frame, text]),
    }).sort(([a], [b]) => (a < b ? -1 : 1)),
  );
