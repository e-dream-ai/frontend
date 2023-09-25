import React from "react";
import StyledInput, {
  InputAfter,
  InputBefore,
  InputError,
  InputGroup,
} from "./input.styled";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  before?: React.ReactNode;
  after?: React.ReactNode;
  error?: string;
};

// eslint-disable-next-line react/display-name
export const Input: React.FC<InputProps> = React.forwardRef<
  HTMLInputElement,
  InputProps
>(({ before, after, error, ...props }, ref) => (
  <>
    <InputGroup>
      {before && <InputBefore>{before}</InputBefore>}
      <StyledInput ref={ref} {...props}></StyledInput>
      {after && <InputAfter>{after}</InputAfter>}
    </InputGroup>
    <InputGroup>
      <InputError>{error}</InputError>
    </InputGroup>
  </>
));

export default Input;
