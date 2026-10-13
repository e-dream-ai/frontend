import { SEED_DRAFT_PATTERN, clampSeed } from "../constants/seed-options";
import { useNumberInput, type NumberInputRules } from "./useNumberInput";

const SEED_RULES: NumberInputRules = {
  pattern: SEED_DRAFT_PATTERN,
  clamp: clampSeed,
};

export const useSeedInput = (value: number, onChange: (seed: number) => void) =>
  useNumberInput(value, onChange, SEED_RULES);
