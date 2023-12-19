import { DEVICES } from "constants/devices.constants";
import styled, { css } from "styled-components";
import { Sizes } from "types/sizes.types";

const ItemCardSizes = {
  sm: css`
    @media (max-width: ${DEVICES.TABLET}) {
      width: 90vw;
    }
  `,
  md: css`
    @media (max-width: ${DEVICES.TABLET}) {
      width: 90vw;
    }
  `,
  lg: css`
    @media (max-width: ${DEVICES.TABLET}) {
      width: 90vw;
    }
  `,
};

const ImageSizes = {
  sm: css`
    // 16:9 ratio
    width: 120px;
    height: auto;
  `,
  md: css`
    // 16:9 ratio
    width: 142px;
    height: auto;
  `,
  lg: css`
    // 16:9 ratio
    width: 240px;
    height: auto;
  `,
};

export const StyledItemCardList = styled.ul`
  display: flex;
  flex-flow: column;
  margin: 0;
  padding: 0;
`;

export const StyledItemCard = styled.li<{
  isDragEntered?: boolean;
  isMovedOnUpperHalf?: boolean;
  size: Sizes;
}>`
  ${(props) => ItemCardSizes[props.size]}
  display: inline-flex;
  justify-content: space-between;
  list-style: none;
  margin: 0;
  margin-bottom: 0.2rem;
  padding: 1rem;
  background-color: ${(props) => props.theme.colorBackgroundQuaternary};
  /* border: ${(props) =>
    props.isDragEntered
      ? `1px solid ${props.theme.colorPrimary}`
      : `1px solid transparent`}; */

  border-top: ${(props) =>
    props.isDragEntered && props.isMovedOnUpperHalf
      ? `3px solid ${props.theme.colorPrimary}`
      : `3px solid transparent`};
  border-bottom: ${(props) =>
    props.isDragEntered && !props.isMovedOnUpperHalf
      ? `3px solid ${props.theme.colorPrimary}`
      : `3px solid transparent`};
  user-select: none;

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

export const ItemCardImage = styled.img<{ size: Sizes }>`
  aspect-ratio: 16 / 9;
  ${(props) => ImageSizes[props.size]}
  object-fit: cover;
  cursor: pointer;
`;

export const ItemCardBody = styled.div<{
  isDragEntered?: boolean;
}>`
  display: inline-flex;
  pointer-events: ${(props) => (props.isDragEntered ? "none" : "all")};
`;

export const ItemCardBodyDetails = styled.div`
  display: flex;
  flex-flow: column;
`;

export const ThumbnailPlaceholder = styled.div<{ size: Sizes }>`
  aspect-ratio: 16 / 9;
  ${(props) => ImageSizes[props.size]}
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 6rem;
`;
