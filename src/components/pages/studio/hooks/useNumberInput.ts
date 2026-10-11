import { useState, type ChangeEvent, type KeyboardEvent } from "react";

export interface NumberInputRules {
  pattern: RegExp;
  clamp: (value: number) => number;
}

export const useNumberInput = (
  value: number,
  onChange: (value: number) => void,
  { pattern, clamp }: NumberInputRules,
) => {
  const [draft, setDraft] = useState(() => String(value));
  const [committed, setCommitted] = useState(value);

  if (value !== committed) {
    setCommitted(value);
    setDraft(String(value));
  }

  const commit = () => {
    const trimmed = draft.trim();
    const next = /\d/.test(trimmed) ? clamp(Number(trimmed)) : value;
    setDraft(String(value));
    if (next !== value) onChange(next);
  };

  return {
    type: "text" as const,
    inputMode: "numeric" as const,
    value: draft,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      if (pattern.test(e.target.value)) setDraft(e.target.value);
    },
    onBlur: commit,
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      commit();
    },
  };
};

export const wholeNumberRules = (
  min: number,
  max: number,
): NumberInputRules => ({
  pattern: /^\d*$/,
  clamp: (value) => Math.min(max, Math.max(min, Math.trunc(value))),
});
