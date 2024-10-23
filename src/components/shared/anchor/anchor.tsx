import styled, { css } from "styled-components";
import { SpaceProps, space } from "styled-system";
import { Types } from "@/types/style-types.types";
import { Link } from "react-router-dom";

const AnchorType = {
  default: css`
    color: ${(props) => props.theme.textAccentColor};
    text-decoration: underline;
  `,
  primary: css`
    color: ${(props) => props.theme.textAccentColor};
    text-decoration: underline;
  `,
  secondary: css`
    color: ${(props) => props.theme.colorPrimary};
    text-decoration: none;
  `,
  tertiary: css`
    color: ${(props) => props.theme.textPrimaryColor};
  `,
  success: css``,
  danger: css``,
};

const commonStyles = css`
  ${space}
  cursor: pointer;
  -webkit-transition:
    color linear 0.2s,
    background-color linear 0.2s,
    border-color linear 0.2s;
  transition:
    color linear 0.2s,
    background-color linear 0.2s,
    border-color linear 0.2s;

  &:hover {
    color: ${(props) => props.theme.colorSecondary};
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
  text-decoration: none;
`;

export default Anchor;
