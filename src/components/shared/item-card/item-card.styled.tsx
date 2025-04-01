import styled, { css, keyframes } from "styled-components";
import { Sizes } from "@/types/sizes.types";
import { Link } from "react-router-dom";
import { DEVICES } from "@/constants/devices.constants";
import Text from "@/components/shared/text/text";
import { Button } from "../button/button";
import { HighlightPosition } from "@/types/item-card.types";
import { ItemType } from "./item-card";

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
  word-break: break-all;
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

export const ItemCardAnchor = styled(Link) <{
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

export const PlayButton = styled(Button) <{ playType: ItemType }>`
  padding: ${(props) =>
    props.playType == "playlist" || props.playType == "virtual-playlist" ? 0 : "default"
  };
  svg {
    filter: drop-shadow(0.2rem 0.2rem 0.2rem #000);
  }
`;

const ICStyledBorder = styled.div<{ position: HighlightPosition }>`
  position: absolute;
  left: 0;
  right: 0;
  height: ${HighlightBorderHeightPx}px;
  background-color: ${(props) => props.theme.colorPrimary};
  pointer-events: none;
  ${({ position }) =>
    position === "top"
      ? `top: -${HighlightBorderHeightPx}px;`
      : `bottom: -${HighlightBorderHeightPx}px;`}
`;

interface HighlightBorderProps {
  isHighlighted: boolean;
  position: HighlightPosition;
}

export const HighlightBorder: React.FC<HighlightBorderProps> = ({
  isHighlighted,
  position,
}) => {
  if (!isHighlighted) return null;

  return <ICStyledBorder position={position} />;
};
