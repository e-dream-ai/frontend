import styled, { css } from "styled-components";
import { Sizes } from "@/types/sizes.types";
import { Link } from "react-router-dom";
import { DEVICES } from "@/constants/devices.constants";
import Text from "@/components/shared/text/text";

const ItemCardSizes = {
  sm: css``,
  md: css``,
  lg: css``,
};

const ImageSizes = {
  sm: css`
    max-width: 200px;
  `,
  md: css``,
  lg: css``,
};

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
`;

export const StyledItemCardList = styled.ul<{
  grid?: boolean;
}>`
  display: flex;
  flex-wrap: wrap;
  flex: auto;
  list-style-type: none;
  padding: 0;
  margin: 0;
  gap: ${(props) => (props?.grid ? "10px" : "0")};

  li {
    width: ${(props) => (props?.grid ? "calc(1/3 * 100% - 20px/3)" : "100%")};
    max-width: ${(props) =>
      props?.grid ? "calc(1/3 * 100% - 20px/3)" : "100%"};
  }

  @media (max-width: ${DEVICES.LAPTOP}) {
    li {
      width: ${(props) => (props?.grid ? "calc(50% - 5px)" : "100%")};
      max-width: ${(props) => (props?.grid ? "calc(50% - 5px)" : "100%")};
    }
  }

  @media (max-width: ${DEVICES.TABLET}) {
    li {
      width: 100%;
      max-width: 100%;
    }
  }
`;

export const StyledItemCard = styled.li<{
  isDragEntered?: boolean;
  isMovedOnUpperHalf?: boolean;
  size: Sizes;
  grid?: boolean;
}>`
  display: flex;
  flex-wrap: wrap;
  flex: auto;

  ${(props) => ItemCardSizes[props.size]}

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
  display: flex;
  flex: auto;
  pointer-events: ${(props) => (props.isDragEntered ? "none" : "all")};
  color: ${(props) => props.theme.textBodyColor};
  text-decoration: none;
`;

export const ItemCardImage = styled.img<{ size: Sizes }>`
  // 16:9 ratio
  aspect-ratio: 16 / 9;
  display: flex;
  flex: 1 1 auto;
  object-fit: cover;
  cursor: pointer;
  max-width: 100%;
  height: auto;
  ${(props) => ImageSizes[props.size]}

  @media (max-width: ${DEVICES.TABLET}) {
    width: auto;
    /* 
    * use max-width if image gets too large
    * max-width: 400px;
    */
  }

  @media (max-width: ${DEVICES.MOBILE_L}) {
    max-width: 100%;
    width: auto;
  }
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

  @media (max-width: ${DEVICES.TABLET}) {
    /* 
    * use max-width if image gets too large
    * max-width: 400px;
    */
    width: auto;
  }

  @media (max-width: ${DEVICES.MOBILE_L}) {
    max-width: 100%;
    width: auto;
  }
`;
