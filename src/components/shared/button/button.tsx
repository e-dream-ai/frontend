import { Sizes } from "types/sizes.types";
import { Types } from "types/style-types.types";
import StyledButton, { ButtonAfter, ButtonBefore } from "./button.styled";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  isLoading?: boolean;
  size?: Sizes;
  marginLeft?: boolean;
  marginRight?: boolean;
  before?: React.ReactNode;
  after?: React.ReactNode;
  buttonType?: Types;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  before,
  after,
  isLoading,
  size = "md",
  marginLeft,
  marginRight,
  buttonType = "primary",
  ...props
}) => (
  <StyledButton
    size={size}
    marginLeft={marginLeft}
    marginRight={marginRight}
    disabled={isLoading}
    buttonType={buttonType}
    {...props}
  >
    {before && <ButtonBefore className="button-before">{before}</ButtonBefore>}
    {children}
    {after && !isLoading && (
      <ButtonAfter className="button-after">{after}</ButtonAfter>
    )}
    {isLoading && (
      <ButtonAfter>
        <i className="fa fa-spinner fa-spin" />
      </ButtonAfter>
    )}
  </StyledButton>
);
