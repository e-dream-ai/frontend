import styled, { css, keyframes } from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

const pulseDot = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.45; transform: scale(0.85); }
`;

const popIn = keyframes`
  0%   { opacity: 0; transform: scale(0.55); }
  60%  { opacity: 1; transform: scale(1.08); }
  100% { transform: scale(1); }
`;

const shakeOnce = keyframes`
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-2px); }
  40%      { transform: translateX(2px); }
  60%      { transform: translateX(-1px); }
  80%      { transform: translateX(1px); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const breathGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 ${FLOW.processingDim}; }
  50%      { box-shadow: 0 0 0 6px transparent; }
`;

export const GapContainer = styled.div<{ $expanded: boolean }>`
  flex-shrink: 0;
  width: ${(p) => (p.$expanded ? "84px" : "64px")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  cursor: pointer;
  transition: width 0.3s ease;
`;

export const GapLine = styled.div<{
  $configured: boolean;
  $failed: boolean;
}>`
  width: 36px;
  border-top: 1.5px dashed
    ${(p) =>
      p.$failed ? FLOW.error : p.$configured ? FLOW.accent : FLOW.border};
  opacity: ${(p) => (p.$failed ? 0.55 : 1)};
  transition: border-color 0.3s ease;
`;

const nodeBase = css`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
`;

export const StatusNode = styled.div<{ $variant: string }>`
  ${nodeBase}

  ${(p) =>
    p.$variant === "queued" &&
    css`
      background: ${FLOW.bgElevated};
      border: 1px solid ${FLOW.border};
      color: ${FLOW.textDim};
      animation: ${pulseDot} 1.6s ease-in-out infinite;
    `}

  ${(p) =>
    p.$variant === "processing" &&
    css`
      background: ${FLOW.bgElevated};
      border: 1px solid ${FLOW.border};
      color: ${FLOW.processing};
      animation: ${breathGlow} 2s ease-in-out infinite;

      svg {
        animation: ${spin} 1.4s linear infinite;
      }
    `}

  ${(p) =>
    p.$variant === "processed" &&
    css`
      background: ${FLOW.accent};
      color: ${FLOW.bg};
      box-shadow:
        0 0 0 4px ${FLOW.accentDim},
        0 0 14px ${FLOW.accentGlow};
      animation: ${popIn} 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    `}

  ${(p) =>
    p.$variant === "failed" &&
    css`
      background: transparent;
      border: 1.5px solid ${FLOW.error};
      color: ${FLOW.error};
      box-shadow: 0 0 0 4px ${FLOW.errorDim};
      animation: ${shakeOnce} 0.45s ease both;

      &:hover {
        background: ${FLOW.errorDim};
      }
    `}
`;

export const ProgressRing = styled.div<{ $percent: number }>`
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: conic-gradient(
    ${FLOW.processing} ${(p) => p.$percent}%,
    transparent ${(p) => p.$percent}%
  );
  mask: radial-gradient(circle, transparent 60%, #000 61%) center / 100% 100%
    no-repeat;
  -webkit-mask: radial-gradient(circle, transparent 60%, #000 61%) center / 100%
    100% no-repeat;
  pointer-events: none;
`;

export const GapStatusLabel = styled.span<{ $status: string }>`
  font-size: 9px;
  font-family: ${FLOW.fontFamily};
  font-weight: 600;
  color: ${(p) => {
    switch (p.$status) {
      case "processed":
        return FLOW.accent;
      case "processing":
        return FLOW.processing;
      case "queued":
        return FLOW.textDim;
      case "failed":
        return FLOW.error;
      default:
        return FLOW.textMuted;
    }
  }};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  display: inline-flex;
  align-items: center;
  gap: 3px;
`;

export const DurationLabel = styled.span`
  font-size: 11px;
  font-family: ${FLOW.fontFamily};
  font-weight: 600;
  color: ${FLOW.accent};
  letter-spacing: 0.04em;
`;
