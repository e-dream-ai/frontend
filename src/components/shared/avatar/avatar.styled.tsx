import styled, { css } from "styled-components";
import { SpaceProps, space } from "styled-system";

export type AvatarSize = "xs" | "sm" | "md" | "lg";

const AvatarSizes: Record<AvatarSize, ReturnType<typeof css>> = {
  xs: css`
    width: 26px;
    height: 26px;
    font-size: 0.8rem;
  `,
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

export const StyledAvatar = styled.div<{ url?: string; size: AvatarSize }>`
  ${(props) => AvatarSizes[props.size]}
  ${space}
  border-radius: 100%;
  background-color: rgba(30, 30, 30, 1);
  background-image: ${(props) => `url(${props?.url})`};
  background-size: cover;
  background-position: center;
`;

export const AvatarPlaceholder = styled.div<
  { url?: string; size: AvatarSize } & SpaceProps
>`
  ${(props) => AvatarSizes[props.size]}
  ${space}
  border-radius: 100%;
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
`;
