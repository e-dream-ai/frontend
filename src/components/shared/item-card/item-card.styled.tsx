import styled, { css } from "styled-components";
import { Sizes } from "types/sizes.types";

const ImageSizes = {
  sm: css`
    // 480p / 1.6
    width: 200px;
    height: 150px;
  `,
  md: css`
    // 480p / 2
    width: 320px;
    height: 240px;
  `,
  lg: css`
    // 480p / 2
    width: 320px;
    height: 240px;
  `,
};

export const StyledItemCardList = styled.ul`
  margin: 0;
  padding: 0;
`;

export const ItemCardContainer = styled.div`
  display: inline-flex;
`;

export const StyledItemCard = styled.li<{ isDragEntered?: boolean }>`
  /* display: inline-flex; */
  /* flex-flow: row; */
  justify-content: space-between;
  list-style: none;
  margin: 0;
  margin-bottom: 4rem;
  padding: 2rem;
  background-color: ${(props) =>
    props.isDragEntered
      ? props.theme.inputBackgroundColor
      : props.theme.colorBackgroundQuaternary};
  border: ${(props) =>
    props.isDragEntered
      ? `1px solid ${props.theme.colorPrimary}`
      : `1px solid transparent`};
  cursor: pointer;
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
`;

export const ItemCardBody = styled.div`
  pointer-events: none;
  display: inline-flex;
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
