import React from "react";
import { Tooltip } from "react-tooltip";
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
    {
      before,
      after,
      onClickAfter,
      error,
      disabled,
      value,
      anchor,
      name,
      placeholder,
      ...props
    },
    ref,
  ) => {
    return (
      <InputGroup data-tooltip-id={name}>
        <Tooltip id={name} place="right-end" content={placeholder} />
        <InputRow>
          {before && <InputBefore>{before}</InputBefore>}
          {disabled ? (
            <DisabledInput>
              {anchor ? (
                <Anchor onClick={anchor}>{value}</Anchor>
              ) : typeof value === "string" ? (
                value
              ) : (
                value ?? "-"
              )}
            </DisabledInput>
          ) : (
            <StyledInput
              ref={ref}
              disabled={disabled}
              name={name}
              placeholder={placeholder}
              {...props}
            />
          )}
          {after && <InputAfter onClick={onClickAfter}>{after}</InputAfter>}
        </InputRow>
        {error && <InputError>{error}</InputError>}
      </InputGroup>
    );
  },
);

export default Input;
