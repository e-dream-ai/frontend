import type { StylePreset } from "@/types/style-preset.types";

export type StylePresetSort = "recent" | "name" | "shuffle";

const STYLED_PROMPT = /^Style:.*\r?\n\s*Subject:([\s\S]*)$/;

export const applyStylePrompt = (
  prompt: string,
  { name, stylePrompt }: Pick<StylePreset, "name" | "stylePrompt">,
) => {
  const current = prompt.trim();
  const subject = (STYLED_PROMPT.exec(current)?.[1] ?? current).trim();
  const style = stylePrompt.trim().replace(/\.+$/, "");
  return `Style: ${name} ${style}.\nSubject: ${subject}`;
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
