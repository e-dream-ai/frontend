import { SpaceProps } from "styled-system";
import { Sizes } from "@/types/sizes.types";
import { Types } from "@/types/style-types.types";
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
  transparent?: boolean;
} & SpaceProps;

export const Button: React.FC<ButtonProps> = ({
  children,
  before,
  after,
  isLoading,
  size = "md",
  buttonType = "primary",
  transparent,
  ...props
}) => (
  <StyledButton
    size={size}
    disabled={isLoading}
    buttonType={buttonType}
    transparent={transparent}
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
    <div className="overlay" />
  </StyledButton>
);
