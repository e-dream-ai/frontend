import { DEVICES } from "constants/devices.constants";
import styled, { css } from "styled-components";
import { Sizes } from "types/sizes.types";

const ItemCardSizes = {
  sm: css`
    width: 70vw;
    max-width: 650px;

    @media (max-width: ${DEVICES.TABLET}) {
      width: 90vw;
    }
  `,
  md: css`
    width: 80vw;
    max-width: 800px;
    @media (max-width: ${DEVICES.TABLET}) {
      width: 90vw;
    }
  `,
  lg: css`
    width: 60vw;
    max-width: 800px;
    @media (max-width: ${DEVICES.TABLET}) {
      width: 90vw;
    }
  `,
};

const ImageSizes = {
  sm: css`
    // 480p - 360
    // 480/3
    width: 160px;
    height: 120px;
  `,
  md: css`
    // 480p - 360
    // 480/2
    width: 240px;
    height: 180px;
  `,
  lg: css`
    // 480p - 360
    // 480/1.5
    width: 320px;
    height: 240px;
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
  size: Sizes;
}>`
  ${(props) => ItemCardSizes[props.size]}
  display: inline-flex;
  justify-content: space-between;
  list-style: none;
  margin: 0;
  margin-bottom: 0.8rem;
  padding: 1.6rem;
  background-color: ${(props) =>
    props.isDragEntered
      ? props.theme.inputBackgroundColor
      : props.theme.colorBackgroundQuaternary};
  /* border: ${(props) =>
    props.isDragEntered
      ? `1px solid ${props.theme.colorPrimary}`
      : `1px solid transparent`}; */

  border-bottom: ${(props) =>
    props.isDragEntered
      ? `1px solid ${props.theme.colorPrimary}`
      : `1px solid transparent`};
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
  ${(props) => ImageSizes[props.size]}
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 6rem;
`;
