import StyledInput, {
  InputAfter,
  InputBefore,
  InputGroup,
} from "./input.styled";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  before?: React.ReactNode;
  after?: React.ReactNode;
};

export const Input: React.FC<InputProps> = ({ before, after, ...props }) => {
  return (
    <InputGroup>
      {before && <InputBefore>{before}</InputBefore>}
      <StyledInput {...props}></StyledInput>
      {after && <InputAfter>{after}</InputAfter>}
    </InputGroup>
  );
};

export default Input;
