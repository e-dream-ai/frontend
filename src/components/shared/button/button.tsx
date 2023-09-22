import StyledButton, { ButtonAfter, ButtonBefore } from "./button.styled";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  before?: React.ReactNode;
  after?: React.ReactNode;
  isLoading?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  before,
  after,
  isLoading,
}) => (
  <StyledButton>
    {before && <ButtonBefore>{before}</ButtonBefore>}
    {children}
    {after && !isLoading && <ButtonAfter>{after}</ButtonAfter>}
    {isLoading && (
      <ButtonAfter>
        <i className="fa fa-spinner fa-spin" />
      </ButtonAfter>
    )}
  </StyledButton>
);
