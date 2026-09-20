import { css, keyframes } from "styled-components";

const appear = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const DEFAULT_APPEARANCE_DELAY_MS = 250;

export const delayedAppearance = (delayMs = DEFAULT_APPEARANCE_DELAY_MS) => css`
  animation: ${appear} 150ms ease-out ${delayMs}ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: ${appear} 1ms linear ${delayMs}ms both;
  }
`;
