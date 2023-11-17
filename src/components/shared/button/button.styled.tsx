import styled, { css } from "styled-components";
import { Sizes } from "types/sizes.types";
import { Types } from "types/style-types.types";

const ButtonSizes = {
  sm: css`
    font-size: 1rem;
    height: 2rem;

    .button-before {
      font-size: 1.2rem;
    }

    .button-after {
      font-size: 1.2rem;
    }
  `,
  md: css`
    font-size: 1.2rem;
    height: 2.625rem;
    .button-before {
      font-size: 1.6rem;
    }

    .button-after {
      font-size: 1.6rem;
    }
  `,
  lg: css`
    font-size: 1.6;
    height: 3rem;
    .button-before {
      font-size: 2rem;
    }

    .button-after {
      font-size: 2rem;
    }
  `,
};

const ButtonTypes = {
  default: css`
    background-color: ${(props) => props.theme.textPrimaryColor};
  `,
  primary: css`
    background-color: ${(props) => props.theme.colorPrimary};
  `,
  secondary: css`
    background-color: ${(props) => props.theme.colorSecondary};
  `,
  tertiary: css``,
  success: css``,
  danger: css`
    background-color: ${(props) => props.theme.colorDanger};
  `,
};

const ButtonTransparentTypes = {
  default: css`
    color: ${(props) => props.theme.textPrimaryColor};
  `,
  primary: css`
    color: ${(props) => props.theme.colorPrimary};
  `,
  secondary: css`
    color: ${(props) => props.theme.colorSecondary};
  `,
  tertiary: css``,
  success: css``,
  danger: css`
    color: ${(props) => props.theme.colorDanger};
  `,
};

export const StyledButton = styled.button<{
  size: Sizes;
  buttonType: Types;
  marginLeft?: boolean;
  marginRight?: boolean;
  transparent?: boolean;
}>`
  display: inline-flex;
  height: fit-content;
  align-items: center;
  text-transform: uppercase;
  padding: 6px 12px;
  margin-bottom: 0;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  margin-left: ${(props) => (props.marginLeft ? "0.6rem" : 0)};
  margin-right: ${(props) => (props.marginRight ? "0.6rem" : 0)};
  color: ${(props) => props.theme.textPrimaryColor};
  background-color: ${(props) => (props.transparent ? "transparent" : "none")};

  -webkit-transition:
    filter linear 0.4s,
    background-color linear 0.4s,
    border-color linear 0.4s;
  transition:
    filter linear 0.4s,
    background-color linear 0.4s,
    border-color linear 0.4s;

  ${(props) =>
    props.transparent
      ? ButtonTransparentTypes[props.buttonType]
      : ButtonTypes[props.buttonType]}
  ${(props) => ButtonSizes[props.size]}

  &:hover {
    filter: brightness(135%);
  }
  &:disabled {
    background-color: ${(props) => props.theme.colorLightPrimary};
    cursor: not-allowed;
  }
`;

export const ButtonBefore = styled.span`
  margin-right: 5px;
`;

export const ButtonAfter = styled.span`
  margin-left: 5px;
`;

export default StyledButton;
