import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import { SEED_DRAFT_PATTERN, clampSeed } from "../constants/seed-options";

export const useSeedInput = (
  value: number,
  onChange: (seed: number) => void,
) => {
  const [draft, setDraft] = useState(() => String(value));
  const [committed, setCommitted] = useState(value);

  if (value !== committed) {
    setCommitted(value);
    setDraft(String(value));
  }

  const commit = () => {
    const trimmed = draft.trim();
    const next = /\d/.test(trimmed) ? clampSeed(Number(trimmed)) : value;
    setDraft(String(next));
    if (next !== value) onChange(next);
  };

  return {
    type: "text" as const,
    inputMode: "numeric" as const,
    value: draft,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      if (SEED_DRAFT_PATTERN.test(e.target.value)) setDraft(e.target.value);
    },
    onBlur: commit,
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") commit();
    },
  };
};
