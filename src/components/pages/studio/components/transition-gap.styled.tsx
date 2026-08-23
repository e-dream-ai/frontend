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

export const GapContainer = styled.div<{
  $expanded: boolean;
  $selected?: boolean;
}>`
  flex-shrink: 0;
  width: ${(p) => (p.$expanded ? "84px" : "64px")};
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  cursor: pointer;
  user-select: none;
  border-radius: ${FLOW.radiusSm};
  transition:
    width 0.3s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.selected};
    outline-offset: 2px;
  }

  /* Selection reads as a filled blue slab so a run of selected transitions is
     legible at a glance, independent of each one's status colour. */
  ${(p) =>
    p.$selected &&
    css`
      background: ${FLOW.selectedDim};
      box-shadow: inset 0 0 0 1.5px ${FLOW.selected};

      &:hover {
        background: ${FLOW.selectedDim};
      }
    `}
`;

export type GapLineVariant = "idle" | "configured" | "failed" | "mismatched";

const GAP_LINE: Record<GapLineVariant, { color: string; opacity: number }> = {
  idle: { color: FLOW.connector, opacity: 1 },
  configured: { color: FLOW.accent, opacity: 1 },
  failed: { color: FLOW.error, opacity: 0.55 },
  mismatched: { color: FLOW.error, opacity: 1 },
};

export const GapLine = styled.div<{ $variant: GapLineVariant }>`
  width: 36px;
  /* Thicker and solid: at 1.5px dashed in FLOW.border (#2a2a30) the connector
     was nearly invisible against the dark strip, so a healthy flow read as a
     row of unconnected cards. */
  border-top: 3px solid ${(p) => GAP_LINE[p.$variant].color};
  border-radius: 2px;
  opacity: ${(p) => GAP_LINE[p.$variant].opacity};
  transition:
    border-color 0.3s ease,
    opacity 0.3s ease;
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

/**
 * Marks a rendered transition whose settings have been edited since — the video
 * on screen is not what these settings would produce. Sits where the duration
 * used to, so a gap keeps its height whether or not it is marked.
 */
export const StaleDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${FLOW.accent};
  box-shadow: 0 0 0 3px ${FLOW.accentGlow};
`;
