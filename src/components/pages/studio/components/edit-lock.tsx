import React from "react";
import { useStudioEditLock } from "../hooks/useStudioEditLock";
import {
  EDITABLE_SELECTOR,
  INTERACTIVE_SELECTOR,
  LINK_SELECTOR,
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

const lockGuards = (onBlocked?: () => void) => ({
  onClickCapture: (event: React.MouseEvent) => {
    if (matches(event, LINK_SELECTOR)) return;
    block(event);
    if (matches(event, INTERACTIVE_SELECTOR)) onBlocked?.();
  },
  onDoubleClickCapture: block,
  onPointerDownCapture: blockInteractive,
  onMouseDownCapture: blockInteractive,
  onTouchStartCapture: (event: React.TouchEvent) => {
    if (matches(event, INTERACTIVE_SELECTOR)) event.stopPropagation();
  },
  onKeyDownCapture: (event: React.KeyboardEvent) => {
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
  },
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
