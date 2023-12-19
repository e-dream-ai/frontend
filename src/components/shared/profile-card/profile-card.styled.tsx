import styled, { css } from "styled-components";
import { SpaceProps, space } from "styled-system";
import { Sizes } from "types/sizes.types";

const AvatarSizes = {
  sm: css`
    width: 100px;
    height: 100px;
  `,
  md: css`
    width: 160px;
    height: 160px;
  `,
  lg: css`
    width: 200px;
    height: 200px;
  `,
};

export const AvatarPlaceholder = styled.div<
  { url?: string; size: Sizes } & SpaceProps
>`
  ${(props) => AvatarSizes[props.size]}
  ${space}
  border-radius: 100%;
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 6rem;
`;

export const Avatar = styled.div<{ url?: string; size: Sizes }>`
  ${(props) => AvatarSizes[props.size]}
  ${space}
  border-radius: 100%;
  background-color: rgba(30, 30, 30, 1);
  background-image: ${(props) => `url(${props?.url})`};
  background-size: contain;
`;
