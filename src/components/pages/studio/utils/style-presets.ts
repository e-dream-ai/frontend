import type { StylePreset } from "@/types/style-preset.types";

export type StylePresetSort = "recent" | "name" | "shuffle";

export const applyStylePrompt = (
  prompt: string,
  stylePrompt: string,
  knownStylePrompts: readonly string[],
) => {
  const subject = knownStylePrompts
    .reduce((text, known) => text.split(known).join(""), prompt)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return subject ? `${subject}\n\n${stylePrompt}` : stylePrompt;
};

export const matchesStyleSearch = (preset: StylePreset, query: string) => {
  const needle = query.trim().toLowerCase();
  return (
    !needle ||
    preset.name.toLowerCase().includes(needle) ||
    preset.section.toLowerCase().includes(needle)
  );
};

export const sortStylePresets = (
  presets: readonly StylePreset[],
  sort: StylePresetSort,
  ranks: Record<Exclude<StylePresetSort, "name">, Map<string, number>>,
): StylePreset[] => {
  const sorted = [...presets];
  if (sort === "name") {
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  const rank = ranks[sort];
  const rankOf = (preset: StylePreset) =>
    rank.get(preset.uuid) ?? Number.MAX_SAFE_INTEGER;
  return sorted.sort((a, b) => rankOf(a) - rankOf(b));
};
