import React, { KeyboardEventHandler } from "react";
import {
  StyledTextArea,
  TextAreaAfter,
  TextAreaBefore,
  TextAreaError,
  TextAreaGroup,
  TextAreaRow,
} from "./text-area.styled";
import { Tooltip } from "react-tooltip";

export type TextAreaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
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
      placeholder,
      ...props
    },
    ref,
  ) => {
    const handleOnKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (
      event,
    ) => {
      if (event.key === "Enter") {
        event.preventDefault();
      }
      onKeyDown?.(event);
    };
    return (
      <TextAreaGroup data-tooltip-id={name}>
        <Tooltip id={name} place="right-end" content={placeholder} />
        <TextAreaRow>
          {before && <TextAreaBefore>{before}</TextAreaBefore>}
          <StyledTextArea
            ref={ref}
            maxLength={400}
            onKeyDown={handleOnKeyDown}
            name={name}
            placeholder={placeholder}
            {...props}
          />
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
