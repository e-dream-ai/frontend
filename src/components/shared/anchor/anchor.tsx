import styled, { css } from "styled-components";
import { Types } from "types/style-types.types";

const AnchorType = {
  primary: css`
    color: ${(props) => props.theme.primary};
  `,
  secondary: css`
    color: ${(props) => props.theme.danger};
  `,
  tertiary: css`
    color: ${(props) => props.theme.danger};
  `,
};

export const Anchor = styled.a<{
  type?: Types;
}>`
  ${(props) => AnchorType[props.type || "primary"]}
  cursor: pointer;
  -webkit-transition:
    color linear 0.4s,
    background-color linear 0.4s,
    border-color linear 0.4s;
  transition:
    color linear 0.4s,
    background-color linear 0.4s,
    border-color linear 0.4s;

  &:hover {
    color: ${(props) => props.theme.text1};
  }
`;

export default Anchor;
