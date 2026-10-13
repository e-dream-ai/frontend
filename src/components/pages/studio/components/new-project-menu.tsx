import React, { useId, useRef, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { buildStudioEditorPath } from "@/constants/routes.constants";
import {
  STUDIO_MODES,
  STUDIO_MODE_DESCRIPTIONS,
  STUDIO_MODE_LABELS,
} from "../constants/studio-modes";
import { useDismiss } from "../hooks/useDismiss";
import {
  Anchor,
  Item,
  ItemHint,
  ItemName,
  Menu,
  MenuItem,
  Trigger,
} from "./new-project-menu.styled";

export const NewProjectMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const anchorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useDismiss({
    open,
    onOpenChange: setOpen,
    containerRef: anchorRef,
    triggerRef,
  });

  return (
    <Anchor ref={anchorRef}>
      <Trigger
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <Plus size={14} strokeWidth={2.4} />
        New playlist
        <ChevronDown size={14} strokeWidth={2.4} />
      </Trigger>

      {open ? (
        <Menu id={menuId} aria-label="Playlist types">
          {STUDIO_MODES.map((mode) => (
            <MenuItem key={mode}>
              <Item
                $mode={mode}
                to={buildStudioEditorPath(mode)}
                onClick={() => setOpen(false)}
              >
                <ItemName>{STUDIO_MODE_LABELS[mode]}</ItemName>
                <ItemHint>{STUDIO_MODE_DESCRIPTIONS[mode]}</ItemHint>
              </Item>
            </MenuItem>
          ))}
        </Menu>
      ) : null}
    </Anchor>
  );
};
