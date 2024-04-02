import styled, { css } from "styled-components";
import { Sizes } from "@/types/sizes.types";
import { Link } from "react-router-dom";
import { DEVICES } from "@/constants/devices.constants";

const ItemCardSizes = {
  sm: css``,
  md: css``,
  lg: css``,
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
  flex: 1;
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
  list-style: none;
  background-color: ${(props) => props.theme.colorBackgroundQuaternary};

  border-top: ${(props) =>
    props.isDragEntered && props.isMovedOnUpperHalf
      ? `3px solid ${props.theme.colorPrimary}`
      : `3px solid ${props.theme.colorBackgroundTertiary}`};
  border-bottom: ${(props) =>
    props.isDragEntered && !props.isMovedOnUpperHalf
      ? `3px solid ${props.theme.colorPrimary}`
      : `3px solid ${props.theme.colorBackgroundTertiary}`};
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

export const ItemCardAnchor = styled(Link).withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    !["isDragEntered"].includes(prop) && defaultValidatorFn(prop),
})<{
  isDragEntered?: boolean;
}>`
  pointer-events: ${(props) => (props.isDragEntered ? "none" : "all")};
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  margin: 0;
  margin-bottom: 0.2rem;
  padding: 1rem;
  color: ${(props) => props.theme.textBodyColor};
  text-decoration: none;
`;

export const ItemCardImage = styled.img<{ size: Sizes }>`
  aspect-ratio: 16 / 9;
  ${(props) => ImageSizes[props.size]}
  object-fit: cover;
  cursor: pointer;
  margin-right: 1rem;

  @media (max-width: ${DEVICES.MOBILE_L}) {
    width: auto;
    margin: 0;
    margin-bottom: 1rem;
  }
`;

export const ItemCardBody = styled.div`
  display: inline-flex;

  @media (max-width: ${DEVICES.MOBILE_L}) {
    width: 100%;
    flex-flow: column;
  }
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
  font-size: 3rem;

  @media (max-width: ${DEVICES.MOBILE_L}) {
    width: auto;
    margin-bottom: 1rem;
  }
`;
