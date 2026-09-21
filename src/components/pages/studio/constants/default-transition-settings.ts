import type { TransitionSettings } from "@/types/flow.types";
import { ACTION_PRESETS } from "./action-presets";

/**
 * What the very first transition of an empty flow starts from.
 *
 * Every later transition copies its predecessor instead, so this is a seed, not
 * a scope: there is nothing for the user to edit here and nothing that reaches
 * back into transitions that already exist. That is the whole of what replaced
 * the old flow-wide globals.
 *
 * Materialised from the Abstract preset — which used to be the default stored
 * preset id, resolved at read time — so a fresh flow renders what it always did.
 */
const ABSTRACT = ACTION_PRESETS.find((pack) => pack.name === "Abstract")
  ?.actions[0];

export const DEFAULT_TRANSITION_SETTINGS: TransitionSettings = {
  prompt: ABSTRACT?.prompt ?? "",
  negativePrompt: ABSTRACT?.negativePrompt ?? "",
  duration: 5,
  model: "kling-25-i2v",
  steps: 30,
  guidance: 0.5,
  seed: -1,
  highNoiseLoras: ABSTRACT?.highNoiseLoras ?? [],
  lowNoiseLoras: ABSTRACT?.lowNoiseLoras ?? [],
};
