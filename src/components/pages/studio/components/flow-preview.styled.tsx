import styled from "styled-components";
import { FLOW, flowFadeIn } from "@/constants/flow-theme.constants";

export const PreviewContainer = styled.div`
  padding: 24px 28px;
  border-top: 1px solid ${FLOW.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  animation: ${flowFadeIn} 0.4s ease;
`;

export const PreviewLabel = styled.span`
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
  font-weight: 600;
  color: ${FLOW.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  align-self: flex-start;
`;

export const VideoWrapper = styled.div`
  width: 100%;
  max-width: 480px;
  aspect-ratio: 16 / 9;
  border-radius: ${FLOW.radiusSm};
  overflow: hidden;
  background: ${FLOW.bg};
  cursor: pointer;
  position: relative;
  isolation: isolate;

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

// Hover-revealed nav arrows on the left/right edge of the video.
export const NavButton = styled.button<{ $side: "left" | "right" }>`
  position: absolute;
  top: 50%;
  ${(p) => (p.$side === "left" ? "left: 10px" : "right: 10px")};
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(12, 12, 14, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: ${FLOW.text};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
  z-index: 2;

  ${VideoWrapper}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(212, 168, 83, 0.8);
    color: ${FLOW.bg};
  }

  &:disabled {
    opacity: 0 !important;
    pointer-events: none;
  }
`;

// "01 / 03" clapboard counter in the bottom-right.
export const SegmentCounter = styled.span`
  position: absolute;
  bottom: 8px;
  right: 10px;
  font-family: ${FLOW.fontFamily};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: ${FLOW.text};
  background: rgba(12, 12, 14, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 3px 8px;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  opacity: 0.85;
  z-index: 2;
`;

// Clickable numbered chip rail under the video.
export const ChipRail = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
`;

export const SegmentChip = styled.button<{ $active: boolean }>`
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  font-family: ${FLOW.fontFamily};
  font-size: 9px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;

  background: ${(p) => (p.$active ? FLOW.accent : "transparent")};
  color: ${(p) => (p.$active ? FLOW.bg : FLOW.textDim)};
  border: 1px solid ${(p) => (p.$active ? FLOW.accent : FLOW.border)};
  box-shadow: ${(p) => (p.$active ? `0 0 0 2px ${FLOW.accentDim}` : "none")};

  &:hover {
    color: ${(p) => (p.$active ? FLOW.bg : FLOW.text)};
    border-color: ${(p) => (p.$active ? FLOW.accent : FLOW.borderHover)};
  }
`;

export const ClickHint = styled.span`
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
  color: ${FLOW.textMuted};
  padding-top: 2px;
  text-align: center;
  letter-spacing: 0.04em;
`;

export const LightboxOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${flowFadeIn} 0.3s ease;
  cursor: pointer;
`;

export const LightboxVideo = styled.div`
  width: 90vw;
  max-width: 960px;
  aspect-ratio: 16 / 9;
  border-radius: ${FLOW.radius};
  overflow: hidden;

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

// Legacy export retained in case external consumers import it.
export const SegmentIndicator = ChipRail;
export const SegmentDot = SegmentChip;
