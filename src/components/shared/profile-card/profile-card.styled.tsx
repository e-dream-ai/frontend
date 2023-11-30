import styled from "styled-components";
import { SpaceProps, space } from "styled-system";

export const AvatarPlaceholder = styled.div<SpaceProps>`
  ${space}
  width: 200px;
  height: 200px;
  border-radius: 100%;
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 6rem;
`;

export const Avatar = styled.div<{ url?: string }>`
  ${space}
  width: 200px;
  height: 200px;
  border-radius: 100%;
  background-color: rgba(30, 30, 30, 1);
  background-image: ${(props) => `url(${props?.url})`};
  background-size: contain;
`;
