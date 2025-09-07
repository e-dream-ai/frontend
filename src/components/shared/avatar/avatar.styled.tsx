import styled, { css } from "styled-components";
import { Sizes } from "@/types/sizes.types";
import { SpaceProps, space } from "styled-system";

const AvatarSizes = {
  sm: css`
    width: 42px;
    height: 42px;
    font-size: 1.6rem;
  `,
  md: css`
    width: 60px;
    height: 60px;
    font-size: 2.6rem;
  `,
  lg: css`
    width: 200px;
    height: 200px;
    font-size: 3rem;
  `,
};

export const StyledAvatar = styled.div<{ url?: string; size: Sizes }>`
  ${(props) => AvatarSizes[props.size]}
  ${space}
  border-radius: 100%;
  background-color: rgba(30, 30, 30, 1);
  background-image: ${(props) => `url(${props?.url})`};
  background-size: cover;
  background-position: center;
`;

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
`;
