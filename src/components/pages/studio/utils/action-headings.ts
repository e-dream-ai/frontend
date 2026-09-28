import type { StudioAction } from "@/types/studio.types";

/** Words that never make a heading on their own. */
const STOPWORDS = new Set(
  (
    "a an the and or but nor so yet of in on at to for from by with into onto " +
    "over under up down out off as is are was were be been being it its this " +
    "that these those they them their there then than he she his her him we " +
    "our you your i my me all each every some any no not very more most much " +
    "while when where which who whom what how also just only both such same " +
    "has have had do does did will would can could should may might shall"
  ).split(" "),
);

/** Longest heading, in characters, before it stops adding words: two lines. */
const MAX_CHARS = 22;
const MAX_WORDS = 5;

const words = (prompt: string) =>
  (prompt.toLowerCase().match(/[a-z0-9]+(?:'[a-z]+)?/g) ?? [])
    .map((w) => w.replace(/'s$/, ""))
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));

const take = (candidates: string[]) => {
  const picked: string[] = [];
  let length = 0;
  for (const word of candidates) {
    if (picked.includes(word)) continue;
    const next = length + (picked.length > 0 ? 1 : 0) + word.length;
    if (picked.length > 0 && next > MAX_CHARS) break;
    picked.push(word);
    length = next;
    if (picked.length === MAX_WORDS) break;
  }
  return picked.join(" ");
};

/**
 * A few words to head each matrix column, in column order. An action made by
 * copying and editing another is named by what it added: its first words that
 * no earlier action used, or failing that a LoRA no earlier action used. One
 * with nothing new, like the first, falls back to its own first meaningful
 * words. Earlier headings never change when a column is added after them.
 */
export const actionHeadings = (
  actions: readonly StudioAction[],
  loraLabelOf: (action: StudioAction) => string | undefined = () => undefined,
) => {
  const seenWords = new Set<string>();
  const seenLoras = new Set<string>();
  return actions.map((action) => {
    const own = words(action.prompt);
    const fresh = own.filter((w) => !seenWords.has(w));
    for (const w of own) seenWords.add(w);
    const lora = loraLabelOf(action);
    const freshLora = lora !== undefined && !seenLoras.has(lora);
    if (lora !== undefined) seenLoras.add(lora);
    return take(fresh) || (freshLora ? lora : "") || take(own);
  });
};
