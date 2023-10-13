import React from "react";
import StyledInput, {
  InputAfter,
  InputBefore,
  InputError,
  InputGroup,
  InputRow,
} from "./input.styled";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  before?: React.ReactNode;
  after?: React.ReactNode;
  error?: string;
  onClickAfter?: () => void;
};

// eslint-disable-next-line react/display-name
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ before, after, onClickAfter, error, ...props }, ref) => (
    <InputGroup>
      <InputRow>
        {before && <InputBefore>{before}</InputBefore>}
        <StyledInput ref={ref} {...props}></StyledInput>
        {after && <InputAfter onClick={onClickAfter}>{after}</InputAfter>}
      </InputRow>
      {error && <InputError>{error}</InputError>}
    </InputGroup>
  ),
);

export default Input;
