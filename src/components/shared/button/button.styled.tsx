import styled, { css } from "styled-components";
import { Sizes } from "types/sizes.types";

const ButtonSizes = {
  sm: css`
    font-size: 1rem;

    .button-before {
      font-size: 1.2rem;
    }

    .button-after {
      font-size: 1.2rem;
    }
  `,
  md: css`
    font-size: 1.2rem;
    .button-before {
      font-size: 1.6rem;
    }

    .button-after {
      font-size: 1.6rem;
    }
  `,
  lg: css`
    font-size: 1.6;
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
  color: #fff;
  background-color: #ff5d20;
  padding: 6px 12px;
  margin-bottom: 0;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  ${(props) => ButtonSizes[props.size]}
  margin-left: ${(props) => (props.marginLeft ? "0.6rem" : 0)};
  margin-right: ${(props) => (props.marginRight ? "0.6rem" : 0)};
`;

export const ButtonBefore = styled.span`
  margin-right: 5px;
`;

export const ButtonAfter = styled.span`
  margin-left: 5px;
`;

export default StyledButton;
