import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { OtpBox, OtpWrapper } from "./otp-input.styled";

export type OtpInputHandle = { focus: () => void };

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
  autoFocus?: boolean;
  onComplete?: (value: string) => void;
};

export const OtpInput = forwardRef<OtpInputHandle, OtpInputProps>(
  (
    { value, onChange, length = 6, disabled, hasError, autoFocus, onComplete },
    ref,
  ) => {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    useImperativeHandle(ref, () => ({
      focus: () => inputsRef.current[0]?.focus(),
    }));

    const digits = Array.from({ length }, (_, i) => value[i] ?? "");

    const commit = (index: number, digit: string) => {
      const next = digits.slice();
      next[index] = digit;
      const joined = next.join("").slice(0, length);
      onChange(joined);
      return joined;
    };

    const handleChange = (
      index: number,
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const cleaned = event.target.value.replace(/\D/g, "");
      if (!cleaned) return;
      const char = cleaned[cleaned.length - 1];
      const joined = commit(index, char);
      if (index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
      if (joined.length === length && onComplete) {
        onComplete(joined);
      }
    };

    const handleKeyDown = (
      index: number,
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.key === "Backspace") {
        event.preventDefault();
        if (digits[index]) {
          commit(index, "");
        } else if (index > 0) {
          inputsRef.current[index - 1]?.focus();
          commit(index - 1, "");
        }
      } else if (event.key === "ArrowLeft" && index > 0) {
        inputsRef.current[index - 1]?.focus();
      } else if (event.key === "ArrowRight" && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      const pasted = event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, length);
      if (!pasted) return;
      onChange(pasted);
      const focusIndex = Math.min(pasted.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
      if (pasted.length === length && onComplete) {
        onComplete(pasted);
      }
    };

    return (
      <OtpWrapper role="group" aria-label="Verification code">
        {digits.map((digit, index) => (
          <OtpBox
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            value={digit}
            disabled={disabled}
            $hasError={hasError}
            $filled={!!digit}
            autoFocus={autoFocus && index === 0}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </OtpWrapper>
    );
  },
);

OtpInput.displayName = "OtpInput";

export default OtpInput;
