import { take, words } from "./action-headings";

interface NamedImage {
  name: string;
  prompt?: string;
}

const FALLBACK = "Image";

const sameText = (a?: string, b?: string) =>
  a !== undefined && b !== undefined && a.trim() === b.trim();

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Numbers taken in a name's family: the bare name is 1, "name 3" is 3. */
const familyNumbers = (root: string, existing: readonly NamedImage[]) => {
  const pattern = new RegExp(`^${escape(root)}(?: (\\d+))?$`, "i");
  const numbers = new Set<number>();
  const members: NamedImage[] = [];
  for (const image of existing) {
    const match = image.name.trim().match(pattern);
    if (!match) continue;
    numbers.add(match[1] ? Number(match[1]) : 1);
    members.push(image);
  }
  return { numbers, members };
};

/**
 * Names for `count` frames about to be generated from `prompt`, headed like
 * the matrix columns: its first few meaningful words. A name another prompt
 * already has gives way to the words this one adds, as a remixed column is
 * named; frames from the same prompt are numbered instead: "tiger jungle",
 * "tiger jungle 2", and so on.
 */
export const imageNames = (
  prompt: string,
  count: number,
  existing: readonly NamedImage[],
): string[] => {
  const own = words(prompt);
  let root = take(own) || FALLBACK;

  const { members } = familyNumbers(root, existing);
  const clashes =
    members.length > 0 && !members.some((m) => sameText(m.prompt, prompt));
  if (clashes) {
    const theirs = new Set(members.flatMap((m) => words(m.prompt ?? m.name)));
    const fresh = take(own.filter((w) => !theirs.has(w)));
    // With nothing new to say, or that name taken too, it is numbered.
    if (fresh && familyNumbers(fresh, existing).members.length === 0) {
      root = fresh;
    }
  }

  const taken = familyNumbers(root, existing).numbers;
  const names: string[] = [];
  for (let n = 1; names.length < count; n++) {
    if (taken.has(n)) continue;
    names.push(n === 1 ? root : `${root} ${n}`);
  }
  return names;
};
