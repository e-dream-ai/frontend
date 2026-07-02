import styled, { css, keyframes } from "styled-components";
import { Sizes } from "@/types/sizes.types";
import { Link } from "react-router-dom";
import { DEVICES } from "@/constants/devices.constants";
import Text from "@/components/shared/text/text";
import { Button } from "../button/button";
import { HighlightPosition } from "@/types/item-card.types";
import { ItemType } from "./item-card";
import { DreamStatusBadgeTone } from "@/utils/dream.util";

const ItemCardSizes = {
  sm: css``,
  md: css``,
  lg: css``,
};

const ImageSizes = {
  sm: css`
    max-width: 200px;
    min-width: 200px;
  `,
  md: css``,
  lg: css``,
};

const HighlightBorderHeightPx = 4;

// Pulse animation
const pulse = keyframes`
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
`;

export const UsernameText = styled(Text)`
  display: flex;
  display: -ms-flexbox;
  display: -webkit-box;

  -webkit-box-orient: vertical;
  -ms-flex-direction: column;
  flex-direction: column;

  -webkit-line-clamp: 1;
  -ms-line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
`;

export const ItemTitleText = styled(Text)`
  display: flex;
  display: -ms-flexbox;
  display: -webkit-box;

  -webkit-box-orient: vertical;
  -ms-flex-direction: column;
  flex-direction: column;

  -webkit-line-clamp: 2;
  -ms-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
`;

export const StyledItemCard = styled.li<{
  size: Sizes;
}>`
  display: flex;
  flex-wrap: wrap;
  flex: auto;
  position: relative;
  margin: 0;
  border: 0;
  min-height: 150px;

  ${(props) => ItemCardSizes[props.size]}

  background-color: ${(props) => props.theme.colorBackgroundQuaternary};

  -webkit-transition:
    color linear 0.4s,
    background-color linear 0.4s,
    border-color linear 0.4s;
  transition:
    color linear 0.4s,
    background-color linear 0.4s,
    border-color linear 0.4s;

  &[data-touch-dragging="true"] {
    box-shadow: 0 0 0 2px ${(props) => props.theme.colorPrimary};
    background-color: ${(props) => props.theme.colorBackgroundSecondary};
  }

  &[data-dnd-mode="local"] {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  &[draggable="true"] {
    -webkit-touch-callout: none;
  }

  :hover {
    background-color: ${(props) => props.theme.colorBackgroundSecondary};
  }
`;

export const StyledItemCardSkeleton = styled.li<{
  size: Sizes;
}>`
  display: flex;
  flex-wrap: wrap;
  flex: auto;
  position: relative;
  margin: 2px 0;
  border: 0;
  min-height: 150px;
  justify-content: center;
  align-items: center;

  ${(props) => ItemCardSizes[props.size]}

  background-color: ${(props) => props.theme.colorBackgroundQuaternary};
`;

export const ItemCardAnchor = styled(Link)<{
  isDragging?: boolean;
  highlightPosition?: "top" | "bottom";
}>`
  display: flex;
  flex: auto;
  /* pointer-events: none; */
  /* touch-action: none; */

  color: ${(props) => props.theme.textBodyColor};
  text-decoration: none;

  .itemCard__title {
    color: ${(props) => props.theme.colorPrimary};
  }

  &:hover {
    .itemCard__title {
      color: ${(props) => props.theme.colorSecondary};
    }
  }
`;

// Imagge Skeleton Loader
export const ImageSkeleton = styled.div<{ size: Sizes }>`
  width: 100%;
  ${(props) => ImageSizes[props.size]}
  // 16:9 ratio
  aspect-ratio: 16 / 9;
  background-color: #222;
  animation: ${pulse} 1.5s infinite ease-in-out;
`;

export const StyledErrorContainer = styled.div<{ size: Sizes }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  ${(props) => ImageSizes[props.size]}
  // 16:9 ratio
  aspect-ratio: 16 / 9;
  background-color: #222;
`;

export const StyledItemCardImage = styled.img<{ size: Sizes }>`
  // 16:9 ratio
  aspect-ratio: 16 / 9;
  display: flex;
  flex: 1 1 auto;
  object-fit: cover;
  cursor: pointer;
  max-width: 100%;
  height: auto;
  -webkit-user-drag: none;
  user-select: none;
  -webkit-touch-callout: none;
  ${(props) => ImageSizes[props.size]}

  @media (max-width: ${DEVICES.MOBILE_S}) {
    max-width: 100%;
    width: auto;
  }
`;

export const ThumbnailGrid = styled.div<{ size: Sizes }>`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  width: 100%;
  overflow: hidden;
`;

export const ThumbnailGridItem = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
`;

export const ThumbnailPlaceholder = styled.div<{ size: Sizes }>`
  // 16:9 ratio
  aspect-ratio: 16 / 9;
  display: flex;
  flex: 1 1 auto;
  object-fit: cover;
  cursor: pointer;
  max-width: 100%;
  height: auto;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  background-color: rgba(30, 30, 30, 1);
  ${(props) => ImageSizes[props.size]}

  @media (max-width: ${DEVICES.MOBILE_S}) {
    max-width: 100%;
    width: auto;
  }
`;

const StatusBadgeTones = {
  draft: css`
    color: ${(props) => props.theme.textAccentColor};
  `,
  uploading: css`
    color: ${(props) => props.theme.colorPrimary};
  `,
  processing: css`
    color: ${(props) => props.theme.colorLightPrimary};
  `,
  failed: css`
    color: ${(props) => props.theme.colorDanger};
  `,
};

const PULSING_TONES: DreamStatusBadgeTone[] = ["uploading", "processing"];

export const StatusBadge = styled.span<{ tone: DreamStatusBadgeTone }>`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  pointer-events: none;
  ${(props) => StatusBadgeTones[props.tone]}

  &::before {
    content: "";
    flex: none;
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    background-color: currentColor;
    ${(props) =>
      PULSING_TONES.includes(props.tone) &&
      css`
        animation: ${pulse} 1.5s infinite ease-in-out;
      `}
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
    }
  }
`;

export const StatusPlaceholderIcon = styled.span<{
  tone: DreamStatusBadgeTone;
}>`
  display: inline-flex;
  opacity: 0.45;
  ${(props) => StatusBadgeTones[props.tone]}
`;

export const PlayButton = styled(Button)<{ playType: ItemType }>`
  padding: "default";
  svg {
    filter: drop-shadow(0.2rem 0.2rem 0.2rem #000);
  }
  /* Inherit icon color from button text color */
  color: rgb(252, 217, 183);
  &:hover {
    color: rgb(0, 208, 219);
  }
`;

export const ReorderActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
`;

export const ReorderActionsWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: 0.75rem;

  @media (max-width: ${DEVICES.MOBILE_S}) {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 2;
    margin-left: 0;
    justify-content: flex-end;
    width: auto;
    ${ReorderActions} {
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: flex-end;
    }
  }
`;

export const ReorderActionButton = styled.button`
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 0.35rem;
  border: 1px solid ${(props) => props.theme.colorBackgroundSecondary};
  background-color: ${(props) => props.theme.colorBackgroundQuaternary};
  color: ${(props) => props.theme.textBodyColor};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;

  &:hover:not(:disabled) {
    color: ${(props) => props.theme.colorPrimary};
    border-color: ${(props) => props.theme.colorPrimary};
    background-color: ${(props) => props.theme.colorBackgroundSecondary};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const ICStyledBorder = styled.div<{
  position: HighlightPosition;
  isFirst?: boolean;
}>`
  position: absolute;
  left: 0;
  right: 0;
  height: ${HighlightBorderHeightPx}px;
  background-color: ${(props) => props.theme.colorPrimary};
  pointer-events: none;
  ${({ position, isFirst }) => {
    if (position === "top") {
      return isFirst ? "top: 0;" : `top: -${HighlightBorderHeightPx}px;`;
    }

    return `bottom: -${HighlightBorderHeightPx}px;`;
  }}
`;

interface HighlightBorderProps {
  isHighlighted: boolean;
  position: HighlightPosition;
  isFirst?: boolean;
}

export const HighlightBorder: React.FC<HighlightBorderProps> = ({
  isHighlighted,
  position,
  isFirst,
}) => {
  if (!isHighlighted) return null;

  return <ICStyledBorder position={position} isFirst={isFirst} />;
};
