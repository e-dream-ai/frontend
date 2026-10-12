import React from "react";
import { useStudioEditLock } from "../hooks/useStudioEditLock";
import {
  ALLOW_SELECTOR,
  EDITABLE_SELECTOR,
  INTERACTIVE_SELECTOR,
} from "../utils/edit-lock-targets";
import { Region } from "./edit-lock.styled";

const COPY_KEYS = new Set(["a", "c"]);

const matches = (event: React.SyntheticEvent, selector: string) => {
  const { target, currentTarget } = event;
  if (!(target instanceof Element)) return false;

  const hit = target.closest(selector);
  return hit !== null && currentTarget.contains(hit);
};

const block = (event: React.SyntheticEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

const blockInteractive = (event: React.SyntheticEvent) => {
  if (matches(event, INTERACTIVE_SELECTOR)) block(event);
};

const isAllowed = (event: React.SyntheticEvent) => {
  const { target, currentTarget } = event;
  if (!(target instanceof Element)) return false;

  const allow = target.closest(ALLOW_SELECTOR);
  if (allow === null || !currentTarget.contains(allow)) return false;
  if (!allow.matches(INTERACTIVE_SELECTOR)) return true;

  return target.closest(INTERACTIVE_SELECTOR) === allow;
};

const unlessAllowed =
  <E extends React.SyntheticEvent>(handler: (event: E) => void) =>
  (event: E) => {
    if (!isAllowed(event)) handler(event);
  };

const lockGuards = (onBlocked?: () => void) => ({
  onClickCapture: unlessAllowed((event: React.MouseEvent) => {
    block(event);
    if (matches(event, INTERACTIVE_SELECTOR)) onBlocked?.();
  }),
  onDoubleClickCapture: unlessAllowed(block),
  onPointerDownCapture: unlessAllowed(blockInteractive),
  onMouseDownCapture: unlessAllowed(blockInteractive),
  onTouchStartCapture: unlessAllowed((event: React.TouchEvent) => {
    if (matches(event, INTERACTIVE_SELECTOR)) event.stopPropagation();
  }),
  onKeyDownCapture: unlessAllowed((event: React.KeyboardEvent) => {
    if (event.key === "Tab") return;
    if (
      (event.metaKey || event.ctrlKey) &&
      COPY_KEYS.has(event.key.toLowerCase())
    ) {
      return;
    }

    const editing = matches(event, EDITABLE_SELECTOR);
    const activating =
      (event.key === "Enter" || event.key === " ") &&
      matches(event, INTERACTIVE_SELECTOR);
    if (!editing && !activating) return;

    block(event);
    onBlocked?.();
  }),
  onBeforeInputCapture: block,
  onPasteCapture: block,
  onCutCapture: block,
  onDragStartCapture: block,
  onDropCapture: block,
});

type Props = {
  children: React.ReactNode;
};

export const EditLock: React.FC<Props> = ({ children }) => {
  const { locked, onBlocked } = useStudioEditLock();

  return (
    <Region
      data-locked={locked || undefined}
      {...(locked ? lockGuards(onBlocked) : undefined)}
    >
      {children}
    </Region>
  );
};
