import styled, { css } from "styled-components";
import { SpaceProps, TypographyProps, space, typography } from "styled-system";
import { Sizes } from "@/types/sizes.types";
import { TextTransform, Types } from "@/types/style-types.types";

const ButtonSizes = {
  sm: css`
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
    &:hover {
      filter: brightness(150%);
    }
  `,
  secondary: css`
    background-color: ${(props) => props.theme.colorSecondary};
    &:hover {
      filter: brightness(150%);
    }
  `,
  tertiary: css`
    background-color: ${(props) => props.theme.inputBackgroundColor};
    &:hover {
      filter: brightness(150%);
    }
  `,
  success: css``,
  danger: css`
    background-color: ${(props) => props.theme.colorDanger};
  `,
};

const ButtonTransparentTypes = {
  default: css`
    color: ${(props) => props.theme.textPrimaryColor};
    &:hover {
      color: ${(props) => props.theme.anchorHoverColor};
    }
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
    &:hover {
      color: ${(props) => props.theme.anchorHoverColor};
    }
  `,
};

export const StyledButton = styled.button<
  {
    size: Sizes;
    buttonType: Types;
    transparent?: boolean;
    textTransform?: TextTransform;
  } & SpaceProps &
    TypographyProps
>`
  display: inline-flex;
  height: fit-content;
  align-items: center;
  justify-content: center;
  text-transform: ${(props) => props.textTransform ?? "uppercase"};
  padding: 6px 12px;
  margin-bottom: 0;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  color: ${(props) => props.theme.textPrimaryColor};
  background-color: ${(props) => (props.transparent ? "transparent" : "none")};
  text-wrap: nowrap;

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

  &:disabled {
    cursor: not-allowed;
  }

  .react-tooltip {
    text-transform: none;
  }

  ${space}
  ${typography}
`;

export const ButtonBefore = styled.span`
  margin-right: 5px;
`;

export const ButtonAfter = styled.span`
  margin-left: 5px;
`;

export default StyledButton;
