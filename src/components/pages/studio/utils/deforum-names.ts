import type { DeforumClip } from "@/types/deforum.types";
import { take, words } from "./action-headings";

const FALLBACK = "Animation";

/**
 * A deforum prompt's meaningful words. LoRA tags (`<lora:name:0.5>`) go, and
 * so do the words of their names, which is what trigger words like
 * `ral-trichom` are made of; backtick weight expressions go too.
 */
const promptWords = (text: string) => {
  const loraWords = new Set(
    [...text.matchAll(/<lora:([^:>]+)[^>]*>/gi)].flatMap((m) => words(m[1])),
  );
  const plain = text.replace(/<[^>]*>/g, " ").replace(/`[^`]*`/g, " ");
  return words(plain).filter((w) => !loraWords.has(w));
};

/** Every prompt's words, in frame order. */
const clipWords = (clip: DeforumClip) =>
  [...clip.settings.prompts]
    .sort((a, b) => a.frame - b.frame)
    .flatMap((p) => promptWords(p.text));

/**
 * Names for clips, in order, from what they animate: the first few
 * meaningful words of their prompts. A clip whose name an earlier one already
 * has is named by the words it adds, as remixed studio columns are; failing
 * that it is numbered: "mantis priest", "mantis priest 2".
 */
export const deforumClipNames = (clips: readonly DeforumClip[]): string[] => {
  const used = new Map<string, DeforumClip[]>();
  const names: string[] = [];
  for (const clip of clips) {
    const own = clipWords(clip);
    let name = take(own) || FALLBACK;
    const earlier = used.get(name);
    if (earlier) {
      const theirs = new Set(earlier.flatMap(clipWords));
      const fresh = take(own.filter((w) => !theirs.has(w)));
      if (fresh && !used.has(fresh)) {
        name = fresh;
      } else {
        const root = name;
        for (let n = 2; used.has(name); n++) name = `${root} ${n}`;
      }
    }
    used.set(name, [...(used.get(name) ?? []), clip]);
    names.push(name);
  }
  return names;
};

/** Clips with their names brought up to date; unchanged clips keep identity. */
export const withClipNames = (clips: DeforumClip[]): DeforumClip[] => {
  const names = deforumClipNames(clips);
  let changed = false;
  const next = clips.map((clip, i) => {
    if (clip.name === names[i]) return clip;
    changed = true;
    return { ...clip, name: names[i] };
  });
  return changed ? next : clips;
};
