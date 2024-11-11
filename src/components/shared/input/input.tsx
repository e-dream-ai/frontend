import React from "react";
import { Tooltip } from "react-tooltip";
import Linkify from "react-linkify";
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
  linkify?: boolean;
  href?: string;
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
      linkify,
      href,
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
              {linkify ? (
                <Linkify
                  componentDecorator={(decoratedHref, decoratedText, key) => (
                    <Anchor
                      target="_blank"
                      type="secondary"
                      href={decoratedHref}
                      key={key}
                    >
                      {decoratedText}
                    </Anchor>
                  )}
                >
                  {value}
                </Linkify>
              ) : href ? (
                <Anchor type="secondary" href={href}>
                  {value}
                </Anchor>
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
