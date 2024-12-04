import React, {
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  StyledTextArea,
  DisabledTextArea,
  TextAreaAfter,
  TextAreaBefore,
  TextAreaError,
  TextAreaGroup,
  TextAreaRow,
} from "./text-area.styled";
import { Anchor } from "..";
import Linkify from "react-linkify";
import { Tooltip } from "react-tooltip";

export type TextAreaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    // linkify boolean to show links
    linkify?: boolean;
    before?: React.ReactNode;
    after?: React.ReactNode;
    error?: string;
    onClickAfter?: () => void;
    onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
  };

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      before,
      after,
      onKeyDown,
      onClickAfter,
      error,
      name,
      value,
      linkify,
      placeholder,
      disabled,
      ...props
    },
    ref,
  ) => {
    // create an internal reference for textarea
    const internalRef = useRef<HTMLTextAreaElement>(null);

    // expose internal reference through the forwarded ref
    useImperativeHandle(ref, () => internalRef.current!, [internalRef]);

    // adjust height function
    const adjustHeight = useCallback((textarea: HTMLTextAreaElement) => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }, []);

    // handle change fn, execute from props if exists
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight(e.target);
      props.onChange?.(e);
    };

    const handleOnKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (
      event,
    ) => {
      if (event.key === "Enter") {
        event.preventDefault();
      }
      onKeyDown?.(event);
    };

    // should trigger recalculation when some deps change
    useEffect(() => {
      if (internalRef.current) {
        requestAnimationFrame(() => {
          adjustHeight(internalRef.current!);
        });
      }
    }, [value, internalRef, disabled, adjustHeight]);

    return (
      <TextAreaGroup data-tooltip-id={name}>
        <Tooltip id={name} place="right-end" content={placeholder} />
        <TextAreaRow>
          {before && <TextAreaBefore>{before}</TextAreaBefore>}

          {disabled ? (
            <DisabledTextArea>
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
                  {value || "-"}
                </Linkify>
              ) : (
                value || "-"
              )}
            </DisabledTextArea>
          ) : (
            <StyledTextArea
              ref={internalRef}
              maxLength={4000}
              onKeyDown={handleOnKeyDown}
              name={name}
              placeholder={placeholder}
              disabled={disabled}
              {...props}
              onChange={handleChange}
            />
          )}

          {after && (
            <TextAreaAfter onClick={onClickAfter}>{after}</TextAreaAfter>
          )}
        </TextAreaRow>
        {error && <TextAreaError>{error}</TextAreaError>}
      </TextAreaGroup>
    );
  },
);

export default TextArea;
