import type { StudioAction, VideoModel } from "@/types/studio.types";
import type { TransitionSettings } from "@/types/flow.types";
import { ACTION_PRESETS } from "@/components/pages/studio/constants/action-presets";
import { TRANSITION_PRESETS } from "@/components/pages/studio/constants/transition-presets";
import { fieldComparisonKey } from "./transition-field-values";
import {
  PRESET_GROUPS,
  createActionsFromPreset,
  type PresetGroup,
  type PresetPack,
} from "@/components/pages/studio/constants/preset-packs";

const ALL_PRESET_PACKS: PresetPack[] = [
  ...ACTION_PRESETS,
  ...TRANSITION_PRESETS,
];

const PACKS_BY_NAME = ALL_PRESET_PACKS.reduce((index, pack) => {
  if (!index.has(pack.name)) index.set(pack.name, pack);
  return index;
}, new Map<string, PresetPack>());

export interface PresetGroupOption {
  id: PresetGroup;
  label: string;
  presets: PresetPack[];
}

export function getPresetGroups(model: VideoModel): PresetGroupOption[] {
  const groups: PresetGroupOption[] = PRESET_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    presets: [],
  }));
  const byId = new Map(groups.map((group) => [group.id, group]));
  for (const pack of ALL_PRESET_PACKS) {
    if (pack.model !== "all" && pack.model !== model) continue;
    byId.get(pack.group)?.presets.push(pack);
  }
  return groups;
}

/**
 * Resolve a PresetPack name to a single StudioAction (the first action in the pack).
 * Returns undefined if the preset name is empty or not found.
 */
export function resolvePresetAction(
  presetName: string,
): StudioAction | undefined {
  if (!presetName) return undefined;
  const pack = PACKS_BY_NAME.get(presetName);
  if (!pack) return undefined;
  return createActionsFromPreset(pack)[0];
}

/**
 * A preset applied as an action: the fields it stamps onto the current scope.
 *
 * A preset used to be a stored id that supplied the prompt and LoRAs whenever
 * the transition had none of its own — a setting that behaved like an action.
 * Now it writes values once and is done, so the fields it changed are visible
 * in the panel and editable afterwards like any others.
 */
export function presetSettingsPatch(
  presetName: string,
): Partial<TransitionSettings> | undefined {
  const action = resolvePresetAction(presetName);
  if (!action) return undefined;
  return {
    prompt: action.prompt ?? "",
    negativePrompt: action.negativePrompt ?? "",
    highNoiseLoras: action.highNoiseLoras ?? [],
    lowNoiseLoras: action.lowNoiseLoras ?? [],
  };
}

/**
 * Which of `presets` the given settings still match exactly, or "" for none.
 *
 * Derived, not stored. A preset stays an action — nothing records which one ran
 * — but the menu can show the answer by comparing values, which is stricter
 * than a remembered id: edit the prompt afterwards and this reports no match,
 * where a stored id went on claiming the preset.
 */
export function matchingPresetName(
  settings: TransitionSettings,
  presets: readonly PresetPack[],
): string {
  for (const pack of presets) {
    const patch = presetSettingsPatch(pack.name);
    if (!patch) continue;
    if (
      patch.prompt === settings.prompt &&
      patch.negativePrompt === settings.negativePrompt &&
      fieldComparisonKey(patch.highNoiseLoras) ===
        fieldComparisonKey(settings.highNoiseLoras) &&
      fieldComparisonKey(patch.lowNoiseLoras) ===
        fieldComparisonKey(settings.lowNoiseLoras)
    ) {
      return pack.name;
    }
  }
  return "";
}

/** The shape buildVideoAlgoParams wants, read straight off stored settings. */
export function settingsToAction(
  settings: TransitionSettings,
): Pick<StudioAction, "prompt" | "highNoiseLoras" | "lowNoiseLoras"> {
  return {
    prompt: settings.prompt,
    highNoiseLoras: settings.highNoiseLoras,
    lowNoiseLoras: settings.lowNoiseLoras,
  };
}
