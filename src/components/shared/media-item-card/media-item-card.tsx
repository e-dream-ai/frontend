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

export const StyledMediaItemCardList = styled.ul`
  margin: 0;
  padding: 0;
`;

export const StyledMediaItemCard = styled.li`
  display: inline-flex;
  flex-flow: row;
  justify-content: space-between;
  list-style: none;
  margin: 0;
  margin-bottom: 4rem;
  padding: 2rem;
  background-color: ${(props) => props.theme.colorBackgroundQuaternary};
  cursor: pointer;
  user-select: none;
  :hover {
    background-color: ${(props) => props.theme.colorBackgroundSecondary};
  }
`;

export const MediaItemCardImage = styled.img<{ size: Sizes }>`
  ${(props) => ImageSizes[props.size]}
  object-fit: cover;
`;

export const MediaItemCardBody = styled.div`
  margin-left: 2rem;
  display: flex;
  flex-flow: column;

  span {
    margin: 0.5rem 0;
  }
`;

export const ThumbnailPlaceholder = styled.div<{ size: Sizes }>`
  ${(props) => ImageSizes[props.size]}
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 6rem;
`;
