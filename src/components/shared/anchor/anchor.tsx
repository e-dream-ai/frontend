import styled, { css } from "styled-components";
import { SpaceProps, space } from "styled-system";
import { Types } from "types/style-types.types";

const AnchorType = {
  primary: css`
    color: ${(props) => props.theme.colorPrimary};
  `,
  secondary: css`
    color: ${(props) => props.theme.colorDanger};
  `,
  tertiary: css`
    color: ${(props) => props.theme.colorDanger};
  `,
};

export const Anchor = styled.a<
  {
    type?: Types;
  } & SpaceProps
>`
  ${space}
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
    color: ${(props) => props.theme.textPrimaryColor};
  }
`;

export default Anchor;
