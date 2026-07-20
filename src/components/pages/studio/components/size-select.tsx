import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatSizeLabel, parseSize } from "../constants/size-options";
import {
  Dropdown,
  OptionRow,
  RatioRect,
  Trigger,
  Wrapper,
} from "./size-select.styled";

// Bounding box the aspect-ratio rectangle is fitted into, in px.
const RECT_MAX_WIDTH = 28;
const RECT_MAX_HEIGHT = 20;

// Estimated per-item height + dropdown padding, used to decide whether the
// menu fits below the trigger before it has rendered.
const ITEM_HEIGHT = 32;
const MENU_PADDING = 10;
const MENU_GAP = 4;

const AspectRatioRect: React.FC<{ size: string }> = ({ size }) => {
  const parsed = parseSize(size);
  if (!parsed) {
    return null;
  }
  const scale = Math.min(
    RECT_MAX_WIDTH / parsed.width,
    RECT_MAX_HEIGHT / parsed.height,
  );
  return (
    <RatioRect
      style={{
        width: Math.max(4, Math.round(parsed.width * scale)),
        height: Math.max(4, Math.round(parsed.height * scale)),
      }}
    />
  );
};

interface MenuPosition {
  left: number;
  minWidth: number;
  top?: number;
  bottom?: number;
}

interface Props {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

export const SizeSelect: React.FC<Props> = ({ value, options, onChange }) => {
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const isOpen = menuPosition !== null;

  const toggleOpen = () => {
    if (isOpen || !triggerRef.current) {
      setMenuPosition(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = options.length * ITEM_HEIGHT + MENU_PADDING;
    const fitsBelow =
      rect.bottom + MENU_GAP + menuHeight <= window.innerHeight ||
      rect.top - MENU_GAP - menuHeight < 0;
    setMenuPosition({
      left: rect.left,
      minWidth: rect.width,
      ...(fitsBelow
        ? { top: rect.bottom + MENU_GAP }
        : { bottom: window.innerHeight - rect.top + MENU_GAP }),
    });
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setMenuPosition(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuPosition(null);
      }
    };
    // The menu is position: fixed, so any scroll or resize desyncs it from
    // the trigger; close instead of tracking.
    const handleClose = () => setMenuPosition(null);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [isOpen]);

  return (
    <Wrapper>
      <Trigger
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggleOpen}
      >
        {formatSizeLabel(value)}
        <AspectRatioRect size={value} />
      </Trigger>
      {isOpen &&
        createPortal(
          <Dropdown ref={menuRef} role="listbox" style={menuPosition}>
            {options.map((s) => (
              <OptionRow
                key={s}
                role="option"
                aria-selected={s === value}
                $selected={s === value}
                onClick={() => {
                  onChange(s);
                  setMenuPosition(null);
                }}
              >
                {formatSizeLabel(s)}
                <AspectRatioRect size={s} />
              </OptionRow>
            ))}
          </Dropdown>,
          document.body,
        )}
    </Wrapper>
  );
};
