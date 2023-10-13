import styled, { css } from "styled-components";
import { Sizes } from "types/sizes.types";

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

export const StyledButton = styled.button<{
  size: Sizes;
  marginLeft?: boolean;
  marginRight?: boolean;
}>`
  display: inline-flex;
  height: fit-content;
  align-items: center;
  text-transform: uppercase;
  color: ${(props) => props.theme.text1};
  background-color: ${(props) => props.theme.primary};
  padding: 6px 12px;
  margin-bottom: 0;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  ${(props) => ButtonSizes[props.size]}
  margin-left: ${(props) => (props.marginLeft ? "0.6rem" : 0)};
  margin-right: ${(props) => (props.marginRight ? "0.6rem" : 0)};

  &:disabled {
    background-color: ${(props) => props.theme.lightPrimary};
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
