import React, { useId, useRef } from "react";
import { ChevronDown, Copy, Eye, Loader2 } from "lucide-react";
import { Avatar } from "@/components/shared/avatar/avatar";
import { ROUTES } from "@/constants/routes.constants";
import { useImage } from "@/hooks/useImage";
import type { EditorProjectOwner } from "@/types/editor-project.types";
import type { ResizeOptions } from "@/types/image.types";
import { useDismiss } from "../hooks/useDismiss";
import { Anchor } from "./new-project-menu.styled";
import {
  Owner,
  OwnerName,
  OwnerRole,
  OwnerText,
  Panel,
  RemixButton,
  Spinner,
  Text,
  Trigger,
} from "./view-only-menu.styled";

const AVATAR_RESIZE: ResizeOptions = { width: 142, fit: "cover" };

type Props = {
  owner: EditorProjectOwner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remixing: boolean;
  onRemix: () => void;
};

export const ViewOnlyMenu: React.FC<Props> = ({
  owner,
  open,
  onOpenChange,
  remixing,
  onRemix,
}) => {
  const panelId = useId();
  const anchorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const avatarUrl = useImage(owner?.avatar ?? undefined, AVATAR_RESIZE);

  useDismiss({ open, onOpenChange, containerRef: anchorRef, triggerRef });

  return (
    <Anchor ref={anchorRef}>
      <Trigger
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
      >
        <Eye size={14} strokeWidth={2.2} />
        View only
        <ChevronDown size={14} strokeWidth={2.4} />
      </Trigger>

      {open ? (
        <Panel id={panelId} role="dialog" aria-label="View only">
          {owner ? (
            <Owner to={`${ROUTES.PROFILE}/${owner.uuid}`}>
              <Avatar size="xs" url={avatarUrl} />
              <OwnerText>
                <OwnerName>{owner.name || "Unknown creator"}</OwnerName>
                <OwnerRole>Owner</OwnerRole>
              </OwnerText>
            </Owner>
          ) : null}
          <Text>
            You can look around and play the previews. Remix it to get your own
            copy you can edit and render.
          </Text>
          <RemixButton
            type="button"
            $primary
            autoFocus
            onClick={onRemix}
            disabled={remixing}
          >
            {remixing ? (
              <>
                <Spinner>
                  <Loader2 size={14} strokeWidth={2.4} />
                </Spinner>
                Remixing…
              </>
            ) : (
              <>
                <Copy size={14} strokeWidth={2.2} />
                Remix
              </>
            )}
          </RemixButton>
        </Panel>
      ) : null}
    </Anchor>
  );
};
