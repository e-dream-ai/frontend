import styled, { css, keyframes } from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

const errorBreathe = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 ${FLOW.errorDim}; }
  50%      { box-shadow: 0 0 0 6px transparent; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const CardWrapper = styled.div<{
  $loop?: boolean;
  $isDragging?: boolean;
  $uploading?: boolean;
  $failed?: boolean;
  $candidate?: boolean;
}>`
  flex-shrink: 0;
  width: 140px;
  height: 100px;
  border-radius: ${FLOW.radiusSm};
  overflow: hidden;
  isolation: isolate;
  border: 2px solid ${FLOW.border};
  position: relative;
  cursor: grab;
  transition:
    border-color 0.2s,
    opacity 0.2s,
    transform 0.2s,
    box-shadow 0.2s;

  ${(props) =>
    props.$loop &&
    css`
      opacity: 0.5;
      cursor: default;
      border-style: dashed;
    `}

  ${(props) =>
    props.$isDragging &&
    css`
      opacity: 0.4;
      transform: scale(0.95);
    `}

  ${(props) =>
    props.$uploading &&
    css`
      cursor: default;
      border-color: ${FLOW.accent};
    `}

  ${(props) =>
    props.$failed &&
    css`
      cursor: default;
      border-color: ${FLOW.error};
      animation: ${errorBreathe} 1.8s ease-in-out infinite;
    `}

  ${(props) =>
    props.$candidate &&
    css`
      border-style: dashed;
      border-color: ${FLOW.accent};
    `}

  &:hover {
    border-color: ${(props) =>
      props.$failed
        ? FLOW.error
        : props.$uploading
          ? FLOW.accent
          : props.$loop
            ? FLOW.border
            : FLOW.borderHover};
  }
`;

export const CardImage = styled.img<{ $uploading?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: filter 0.4s ease;
  ${(p) =>
    p.$uploading &&
    css`
      filter: brightness(0.4) saturate(0.55);
    `}
`;

export const UploadOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(12, 12, 14, 0.35);
  pointer-events: none;
`;

export const UploadRing = styled.svg`
  width: 38px;
  height: 38px;
  transform: rotate(-90deg);
`;

export const UploadRingTrack = styled.circle`
  fill: none;
  stroke: rgba(212, 168, 83, 0.18);
  stroke-width: 3;
`;

export const UploadRingFill = styled.circle<{ $percent: number }>`
  fill: none;
  stroke: ${FLOW.accent};
  stroke-width: 3;
  stroke-linecap: round;
  /* circumference = 2π × 16 ≈ 100.53 → use 100 for cleaner math */
  stroke-dasharray: 100;
  stroke-dashoffset: ${(p) => 100 - Math.max(0, Math.min(100, p.$percent))};
  transition: stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const UploadPercent = styled.span`
  font-family: ${FLOW.fontFamily};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: ${FLOW.accent};
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
`;

// i2i candidate "generating" state — an indeterminate gold spinner over a
// dimmed card, so a varying candidate reads as working rather than showing a
// frozen copy of its source image while its own result is still rendering.
export const GeneratingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(12, 12, 14, 0.55);
  backdrop-filter: blur(1px);
  pointer-events: none;
`;

export const GeneratingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(212, 168, 83, 0.22);
  border-top-color: ${FLOW.accent};
  animation: ${spin} 0.8s linear infinite;
`;

export const GeneratingLabel = styled.span`
  font-family: ${FLOW.fontFamily};
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${FLOW.accent};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
`;

export const FailedOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(12, 12, 14, 0.5);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  color: ${FLOW.error};
  font-family: ${FLOW.fontFamily};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  pointer-events: none;

  svg {
    color: ${FLOW.error};
  }
`;

export const CardPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: linear-gradient(135deg, #1a1520, #1d1825);
  font-size: 11px;
  color: ${FLOW.textMuted};
`;

export const CardLabel = styled.div`
  position: absolute;
  bottom: 6px;
  left: 8px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 6px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
`;

export const LoopBadge = styled.span`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${FLOW.accent};
  opacity: 0.7;
`;

export const CandidateBadge = styled.span`
  position: absolute;
  top: 6px;
  left: 8px;
  z-index: 3;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${FLOW.accent};
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 6px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
`;

export const CandidateActions = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  z-index: 3;
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
`;

export const AcceptButton = styled.button`
  height: 20px;
  padding: 0 8px;
  border-radius: 10px;
  background: ${FLOW.successDim};
  color: ${FLOW.success};
  font-family: ${FLOW.fontFamily};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: filter 0.2s;

  &:hover {
    filter: brightness(1.2);
  }
`;

export const DiscardButton = styled.button`
  height: 20px;
  padding: 0 8px;
  border-radius: 10px;
  background: ${FLOW.errorDim};
  color: ${FLOW.error};
  font-family: ${FLOW.fontFamily};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: filter 0.2s;

  &:hover {
    filter: brightness(1.2);
  }
`;

export const DeleteButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: ${FLOW.text};
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;

  ${CardWrapper}:hover & {
    opacity: 1;
  }
`;

// Per-keyframe "Vary" trigger — a circular shuffle icon button (top-left),
// revealed on hover. Generates i2i/t2i variation candidates for this frame.
export const VaryButton = styled.button`
  position: absolute;
  top: 4px;
  left: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: ${FLOW.text};
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.2s,
    color 0.2s;

  &:hover {
    color: ${FLOW.accent};
  }

  ${CardWrapper}:hover & {
    opacity: 1;
  }
`;
