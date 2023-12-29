import React from "react";
import StyledInput, {
  DisabledInput,
  InputAfter,
  InputBefore,
  InputError,
  InputGroup,
  InputRow,
} from "./input.styled";
import { Anchor } from "..";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  anchor?: React.MouseEventHandler<HTMLAnchorElement>;
  before?: React.ReactNode;
  after?: React.ReactNode;
  error?: string;
  onClickAfter?: () => void;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { before, after, onClickAfter, error, disabled, value, anchor, ...props },
    ref,
  ) => {
    console.log({ props, value, ref });
    return (
      <InputGroup>
        <InputRow>
          {before && <InputBefore>{before}</InputBefore>}
          {disabled ? (
            <DisabledInput>
              {anchor ? (
                <Anchor onClick={anchor}>{value}</Anchor>
              ) : (
                value ?? "-"
              )}
            </DisabledInput>
          ) : (
            <StyledInput ref={ref} disabled={disabled} {...props} />
          )}
          {after && <InputAfter onClick={onClickAfter}>{after}</InputAfter>}
        </InputRow>
        {error && <InputError>{error}</InputError>}
      </InputGroup>
    );
  },
);

export default Input;
