import StyledButton, { ButtonAfter, ButtonBefore } from "./button.styled";

export const Button: React.FC<{
  children?: React.ReactNode;
  before?: React.ReactNode;
  after?: React.ReactNode;
}> = ({ children, before, after }) => {
  return (
    <StyledButton>
      {before && <ButtonBefore>{before}</ButtonBefore>}
      {children}
      {after && <ButtonAfter>{after}</ButtonAfter>}
    </StyledButton>
  );
};
