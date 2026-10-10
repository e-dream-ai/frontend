import type { DeforumClip, DeforumRenderKind } from "@/types/deforum.types";
import { deforumSettingsKey } from "./deforum-params";

const isPending = (clip: DeforumClip, kind: DeforumRenderKind) => {
  const status = clip[kind]?.status;
  return status === "queue" || status === "processing";
};

/** Whether the clip's latest render of this kind no longer matches its settings. */
export const isRenderBehind = (
  clip: DeforumClip,
  kind: DeforumRenderKind,
): boolean => {
  const render = clip[kind];
  if (!render || render.status === "failed") return true;
  return (
    deforumSettingsKey(render.settings) !== deforumSettingsKey(clip.settings)
  );
};

export const hasPrompt = (clip: DeforumClip): boolean =>
  clip.settings.prompts.some((p) => p.text.trim());

/**
 * The clips a Test or Render click starts. An explicit selection reruns what
 * was picked, edited or not; with nothing selected it covers every clip whose
 * render of that kind is behind its settings. Clips already rendering and
 * clips with no prompt are left out either way.
 */
export const resolveDeforumTargets = (
  clips: readonly DeforumClip[],
  selectedIds: readonly string[],
  kind: DeforumRenderKind,
): DeforumClip[] => {
  const selected = new Set(selectedIds);
  return clips.filter(
    (clip) =>
      !isPending(clip, kind) &&
      hasPrompt(clip) &&
      (selected.size > 0 ? selected.has(clip.id) : isRenderBehind(clip, kind)),
  );
};

/** Newest finished render, test or final — what the card and preview show. */
export const latestRender = (clip: DeforumClip) =>
  [clip.final, clip.test]
    .filter((r) => r?.status === "processed")
    .sort((a, b) => b!.createdAt - a!.createdAt)[0];

/** Newest render still queued or running, test or final — what a live preview follows. */
export const pendingRender = (clip: DeforumClip) =>
  [clip.final, clip.test]
    .filter((r) => r?.status === "queue" || r?.status === "processing")
    .sort((a, b) => b!.createdAt - a!.createdAt)[0];
