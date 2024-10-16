import React from "react";
import { SpaceProps, TypographyProps } from "styled-system";
import { Sizes } from "@/types/sizes.types";
import { TextTransform, Types } from "@/types/style-types.types";
import StyledButton, { ButtonAfter, ButtonBefore } from "./button.styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  isLoading?: boolean;
  size?: Sizes;
  before?: React.ReactNode;
  after?: React.ReactNode;
  buttonType?: Types;
  transparent?: boolean;
  textTransform?: TextTransform;
} & SpaceProps &
  TypographyProps;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      before,
      after,
      isLoading,
      size = "md",
      buttonType = "primary",
      transparent,
      ...props
    },
    ref,
  ) => (
    <StyledButton
      ref={ref}
      size={size}
      disabled={isLoading}
      buttonType={buttonType}
      transparent={transparent}
      {...props}
    >
      {before && (
        <ButtonBefore className="button-before">{before}</ButtonBefore>
      )}
      {children}
      {after && !isLoading && (
        <ButtonAfter className="button-after">{after}</ButtonAfter>
      )}
      {isLoading && (
        <ButtonAfter>
          <FontAwesomeIcon icon={faSpinner} spin />
        </ButtonAfter>
      )}
      <div className="overlay" />
    </StyledButton>
  ),
);
