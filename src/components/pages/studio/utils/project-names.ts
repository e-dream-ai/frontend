import type { DeforumClip } from "@/types/deforum.types";
import type { FlowTransition } from "@/types/flow.types";
import type {
  StudioAction,
  StudioImage,
  StudioJob,
} from "@/types/studio.types";
import { take } from "./action-headings";
import { promptWords } from "./deforum-names";

/**
 * A playlist name from a prompt: its first few meaningful words, as clip
 * names and matrix headings are made. Empty when the prompt has none.
 */
export const nameFromPrompt = (prompt: string | undefined) =>
  prompt ? take(promptWords(prompt)) : "";

/**
 * The prompt of the flow's first generation: its first frame generated from a
 * prompt, or with none, the earliest transition render. `framePrompts` holds
 * each frame's prompt, in strip order, as its image dream records it.
 */
export const firstFlowPrompt = (
  framePrompts: readonly (string | undefined)[],
  transitions: readonly FlowTransition[],
): string | undefined => {
  const framePrompt = framePrompts.find((p) => p?.trim());
  if (framePrompt) return framePrompt;
  let first: { createdAt: number; prompt: string } | undefined;
  for (const t of transitions) {
    for (const entry of t.history ?? []) {
      if (!first || entry.createdAt < first.createdAt) {
        first = { createdAt: entry.createdAt, prompt: entry.settings.prompt };
      }
    }
  }
  // Transitions rendered before history was kept have only their dream.
  return first?.prompt ?? transitions.find((t) => t.dreamUuid)?.settings.prompt;
};

/** The prompts of the earliest deforum render, test or final, in frame order. */
export const firstDeforumPrompt = (
  clips: readonly DeforumClip[],
): string | undefined => {
  let first: DeforumClip["test"];
  for (const clip of clips) {
    for (const render of [clip.test, clip.final]) {
      if (render && (!first || render.createdAt < first.createdAt)) {
        first = render;
      }
    }
  }
  return first?.settings.prompts
    .slice()
    .sort((a, b) => a.frame - b.frame)
    .map((p) => p.text)
    .join(" ");
};

/**
 * The prompt of the action project's first image generated from a prompt —
 * images are kept in the order they were added. With only uploaded images, the action of the
 * earliest clip.
 */
export const firstActionPrompt = (
  images: readonly StudioImage[],
  actions: readonly StudioAction[],
  jobs: readonly StudioJob[],
): string | undefined => {
  const imagePrompt = images.find((i) => i.prompt?.trim())?.prompt;
  if (imagePrompt) return imagePrompt;
  const earliest = [...jobs].sort(
    (a, b) => (a.startedAt ?? Infinity) - (b.startedAt ?? Infinity),
  )[0];
  return actions.find((a) => a.id === earliest?.actionId)?.prompt;
};
