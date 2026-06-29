// Canned variation presets for the Flow inline variation tool.
//
// Each preset is a fixed pack of modifiers that get layered onto the SOURCE
// image's own prompt to produce distinct-but-on-theme variations. The seed
// stays stable across the set, so the difference comes from the prompt, not
// seed jitter (plain seed variation produced near-identical, generic results).
//
// Per Spot: a CANNED list — no custom prompt editor.

export interface VariationPreset {
  id: string;
  label: string;
  modifiers: string[];
}

export const VARIATION_PRESETS: VariationPreset[] = [
  {
    id: "scene",
    label: "Scene",
    modifiers: [
      "different lighting and time of day",
      "different color palette and mood",
      "different camera angle and composition",
      "different weather and atmosphere",
    ],
  },
  {
    id: "style",
    label: "Art styles",
    modifiers: [
      "impressionist oil painting style",
      "vibrant watercolor illustration",
      "cinematic film still, shallow depth of field",
      "bold graphic poster art",
    ],
  },
  {
    id: "mood",
    label: "Mood",
    modifiers: [
      "serene and peaceful",
      "dramatic and intense",
      "dreamy and ethereal",
      "dark and moody, low key",
    ],
  },
];

export const DEFAULT_VARIATION_PRESET_ID = "scene";

export function getVariationPreset(id: string | undefined): VariationPreset {
  return (
    VARIATION_PRESETS.find((p) => p.id === id) ??
    VARIATION_PRESETS.find((p) => p.id === DEFAULT_VARIATION_PRESET_ID) ??
    VARIATION_PRESETS[0]
  );
}

// Back-compat: the default pack's modifiers.
export const VARIATION_MODIFIERS: string[] = getVariationPreset(
  DEFAULT_VARIATION_PRESET_ID,
).modifiers;
