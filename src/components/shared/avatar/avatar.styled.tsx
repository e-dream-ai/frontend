import styled, { css } from "styled-components";
import { Sizes } from "@/types/sizes.types";
import { SpaceProps, space } from "styled-system";

const AvatarSizes = {
  sm: css`
    width: 60px;
    height: 60px;
  `,
  md: css`
    width: 80px;
    height: 80px;
  `,
  lg: css`
    width: 200px;
    height: 200px;
  `,
};

export const StyledAvatar = styled.div<{ url?: string; size: Sizes }>`
  ${(props) => AvatarSizes[props.size]}
  ${space}
  border-radius: 100%;
  background-color: rgba(30, 30, 30, 1);
  background-image: ${(props) => `url(${props?.url})`};
  background-size: contain;
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
  font-size: 3rem;
`;
