import { diffWords, type Change } from "diff";

export interface PromptSegment {
  text: string;
  added: boolean;
  removed: boolean;
}

export interface MarkedPrompt {
  segments: PromptSegment[];
  linkedBelow: boolean;
}

type Range = readonly [number, number];

const MIN_SHARED_RATIO = 0.3;

const countWordChars = (text: string) => text.replace(/\s+/g, "").length;

const isRelated = (changes: Change[], a: string, b: string) => {
  const shared = changes
    .filter((change) => !change.added && !change.removed)
    .reduce((sum, change) => sum + countWordChars(change.value), 0);
  const longest = Math.max(countWordChars(a), countWordChars(b));
  return longest > 0 && shared / longest >= MIN_SHARED_RATIO;
};

const rangesOnlyInNew = (changes: Change[]): Range[] => {
  const ranges: Range[] = [];
  let offset = 0;
  for (const change of changes) {
    if (change.removed) continue;
    const end = offset + change.value.length;
    if (change.added && change.value.trim()) ranges.push([offset, end]);
    offset = end;
  }
  return ranges;
};

const covers = (ranges: readonly Range[], start: number, end: number) =>
  ranges.some(([from, to]) => from <= start && end <= to);

const toSegments = (
  prompt: string,
  added: readonly Range[],
  removed: readonly Range[],
): PromptSegment[] => {
  if (added.length === 0 && removed.length === 0) {
    return [{ text: prompt, added: false, removed: false }];
  }
  const cuts = Array.from(
    new Set([0, prompt.length, ...added.flat(), ...removed.flat()]),
  ).sort((a, b) => a - b);
  return cuts.slice(0, -1).map((start, i) => {
    const end = cuts[i + 1];
    return {
      text: prompt.slice(start, end),
      added: covers(added, start, end),
      removed: covers(removed, start, end),
    };
  });
};

export const markPromptHistory = (
  prompts: readonly string[],
): MarkedPrompt[] => {
  const added: Range[][] = prompts.map(() => []);
  const removed: Range[][] = prompts.map(() => []);
  const linkedBelow = prompts.map(() => false);

  for (let i = 0; i < prompts.length - 1; i += 1) {
    const above = prompts[i];
    const below = prompts[i + 1];
    if (above === below) {
      linkedBelow[i] = true;
      continue;
    }
    const sinceBelow = diffWords(below, above);
    if (!isRelated(sinceBelow, above, below)) continue;
    linkedBelow[i] = true;
    added[i] = rangesOnlyInNew(sinceBelow);
    removed[i + 1] = rangesOnlyInNew(diffWords(above, below));
  }

  return prompts.map((prompt, i) => ({
    segments: toSegments(prompt, added[i], removed[i]),
    linkedBelow: linkedBelow[i],
  }));
};
