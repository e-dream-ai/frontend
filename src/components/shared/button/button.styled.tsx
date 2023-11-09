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
  primary: css`
    background-color: ${(props) => props.theme.colorPrimary};
    color: ${(props) => props.theme.textPrimaryColor};
    &:hover {
      background: ${(props) => props.theme.colorLightPrimary};
    }
  `,
  secondary: css``,
  tertiary: css`
    background-color: transparent;
    color: ${(props) => props.theme.colorPrimary};

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
  `,
};

export const StyledButton = styled.button<{
  size: Sizes;
  buttonType: Types;
  marginLeft?: boolean;
  marginRight?: boolean;
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
  ${(props) => ButtonTypes[props.buttonType]}
  ${(props) => ButtonSizes[props.size]}

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
