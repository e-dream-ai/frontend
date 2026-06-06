import styled from "styled-components";
import { DEVICES } from "@/constants/devices.constants";

export const OtpWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
  margin-bottom: 1rem;
`;

export const OtpBox = styled.input<{ $hasError?: boolean; $filled?: boolean }>`
  flex: 1 1 0;
  min-width: 0;
  height: 3.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  font-family: inherit;
  color: #fcd9b7;
  background: ${({ $filled }) => ($filled ? "#211d18" : "#1a1a1a")};
  border: 1px solid
    ${({ $hasError, $filled }) =>
      $hasError
        ? "#dc4848"
        : $filled
          ? "rgba(252, 217, 183, 0.35)"
          : "rgba(255, 255, 255, 0.08)"};
  border-radius: 10px;
  caret-color: #fcd9b7;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
  -moz-appearance: textfield;
  appearance: textfield;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: none;
    border-color: ${({ $hasError }) =>
      $hasError ? "#dc4848" : "rgba(252, 217, 183, 0.65)"};
    box-shadow: 0 0 0 3px
      ${({ $hasError }) =>
        $hasError ? "rgba(220, 72, 72, 0.16)" : "rgba(252, 217, 183, 0.14)"};
    background: #1f1f1f;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  @media (max-width: ${DEVICES.TABLET}) {
    height: 3rem;
    font-size: 1.25rem;
    border-radius: 8px;
  }
`;
