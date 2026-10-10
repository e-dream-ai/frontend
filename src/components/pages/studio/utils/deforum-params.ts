import type { DeforumRenderKind, DeforumSettings } from "@/types/deforum.types";
import {
  DEFORUM_SCHEDULE_FIELDS,
  DEFORUM_TEST_FRAMES,
} from "../constants/deforum-options";

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
  const entries = splitSchedule(schedule).map((entry) => {
    const match = /^(\d+)\s*:\s*([\s\S]*)$/.exec(entry);
    return match
      ? { frame: Number(match[1]), value: match[2], raw: entry }
      : { frame: undefined, value: undefined, raw: entry };
  });
  const numeric = entries.filter((e) => e.frame !== undefined);
  const scaled = spreadFrames(
    numeric.map((e) => scaleFrame(e.frame!, fromFrames, toFrames)),
    toFrames - 1,
  );
  let n = 0;
  return entries
    .map((e) => (e.frame === undefined ? e.raw : `${scaled[n++]}: ${e.value}`))
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
  const frames = spreadFrames(
    sorted.map((p) => scaleFrame(p.frame, settings.maxFrames, toFrames)),
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
): Record<string, unknown> => {
  const frames = renderFrames(settings, kind);
  const scale = (schedule: string) =>
    frames === settings.maxFrames
      ? schedule
      : scaleSchedule(schedule, settings.maxFrames, frames);

  const params: Record<string, unknown> = {
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
    border: settings.border,
  };
  for (const { field, param } of DEFORUM_SCHEDULE_FIELDS) {
    params[param] = scale(settings[field]);
  }
  return params;
};

/** Settings compared by value — to tell when a clip has moved past a render. */
export const deforumSettingsKey = (settings: DeforumSettings): string =>
  JSON.stringify({
    ...settings,
    prompts: settings.prompts.map(({ frame, text }) => ({ frame, text })),
  });
