import styled, { css } from "styled-components";
import { SpaceProps, space } from "styled-system";
import { Types } from "@/types/style-types.types";
import { Link } from "react-router-dom";

const AnchorType = {
  default: css`
    color: ${(props) => props.theme.colorPrimary};
  `,
  primary: css`
    color: ${(props) => props.theme.colorPrimary};
  `,
  secondary: css`
    color: ${(props) => props.theme.colorSecondary};
  `,
  tertiary: css`
    color: ${(props) => props.theme.textPrimaryColor};
  `,
  success: css``,
  danger: css``,
};

const commonStyles = css`
  ${space}
  text-decoration: none;
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
    color: ${(props) => props.theme.anchorHoverColor};
  }
`;

export const Anchor = styled.a<
  {
    type?: Types;
  } & SpaceProps
>`
  ${(props) => AnchorType[props.type || "primary"]}
  ${commonStyles}
`;

export const AnchorLink = styled(Link)<
  {
    type?: Types;
  } & SpaceProps
>`
  ${(props) => AnchorType[props.type || "primary"]}
  ${commonStyles}
`;

export default Anchor;
