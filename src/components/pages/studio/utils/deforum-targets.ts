import type {
  DeforumClip,
  DeforumRender,
  DeforumRenderKind,
} from "@/types/deforum.types";
import { deforumSettingsKey } from "./deforum-params";

export interface DeforumRenderRef {
  kind: DeforumRenderKind;
  render: DeforumRender;
}

const isPending = (render: DeforumRender | undefined) =>
  render?.status === "queue" || render?.status === "processing";

const isProcessed = (render: DeforumRender | undefined) =>
  render?.status === "processed";

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
      !isPending(clip[kind]) &&
      hasPrompt(clip) &&
      (selected.size > 0 ? selected.has(clip.id) : isRenderBehind(clip, kind)),
  );
};

const newestRender = (
  clip: DeforumClip,
  include: (render: DeforumRender | undefined) => boolean,
): DeforumRenderRef | undefined => {
  let newest: DeforumRenderRef | undefined;
  for (const kind of ["final", "test"] as const) {
    const render = clip[kind];
    if (
      render &&
      include(render) &&
      (!newest || render.createdAt > newest.render.createdAt)
    ) {
      newest = { kind, render };
    }
  }
  return newest;
};

/** Newest finished render, test or final — what the card and preview show. */
export const latestRender = (clip: DeforumClip) =>
  newestRender(clip, isProcessed);

/** Newest render still queued or running, test or final — what a live preview follows. */
export const pendingRender = (clip: DeforumClip) =>
  newestRender(clip, isPending);

// Live frames follow the selected clip's render; with nothing selected (or
// the selection idle), the most recently started render anywhere.
export const liveRender = (
  clips: readonly DeforumClip[],
  primaryId: string | undefined,
): (DeforumRenderRef & { clip: DeforumClip }) | undefined => {
  const primary = clips.find((clip) => clip.id === primaryId);
  const primaryPending = primary && pendingRender(primary);
  if (primary && primaryPending) return { clip: primary, ...primaryPending };

  let newest: (DeforumRenderRef & { clip: DeforumClip }) | undefined;
  for (const clip of clips) {
    const pending = pendingRender(clip);
    if (
      pending &&
      (!newest || pending.render.createdAt > newest.render.createdAt)
    ) {
      newest = { clip, ...pending };
    }
  }
  return newest;
};

/** The dreams the playlist should hold: each clip's finished final render. */
export const deforumPlaylistDreams = (
  clips: readonly DeforumClip[],
): string[] => [
  ...new Set(
    clips.flatMap(({ final }) =>
      final?.status === "processed" ? [final.dreamUuid] : [],
    ),
  ),
];
