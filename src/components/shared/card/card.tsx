import styled from "styled-components";
import {
  space,
  SpaceProps,
  width,
  WidthProps,
  flexbox,
  FlexboxProps,
} from "styled-system";

type CardProps = SpaceProps & WidthProps & FlexboxProps;

export const Card = styled.div<CardProps>`
  background-color: ${(props) => props.theme.colorBackgroundQuaternary};

  :hover {
    background-color: ${(props) => props.theme.colorBackgroundSecondary};
  }

  ${space}
  ${width}
  ${flexbox}
`;
