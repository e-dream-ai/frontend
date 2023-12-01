import React, { KeyboardEventHandler } from "react";
import {
  StyledTextArea,
  TextAreaAfter,
  TextAreaBefore,
  TextAreaError,
  TextAreaGroup,
  TextAreaRow,
} from "./text-area.styled";

export type TextAreaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    before?: React.ReactNode;
    after?: React.ReactNode;
    error?: string;
    onClickAfter?: () => void;
    onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
  };

// eslint-disable-next-line react/display-name
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ before, after, onKeyDown, onClickAfter, error, ...props }, ref) => {
    const handleOnKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (
      event,
    ) => {
      if (event.key === "Enter") {
        event.preventDefault();
      }
      onKeyDown?.(event);
    };
    return (
      <TextAreaGroup>
        <TextAreaRow>
          {before && <TextAreaBefore>{before}</TextAreaBefore>}
          <StyledTextArea
            ref={ref}
            maxLength={150}
            onKeyDown={handleOnKeyDown}
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
