import styled from "styled-components";
import { FLOW, flowFadeIn } from "@/constants/flow-theme.constants";

export const PreviewContainer = styled.div`
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radius};
  padding: 16px;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: ${flowFadeIn} 0.4s ease;
`;

export const PreviewLabel = styled.span`
  font-family: ${FLOW.fontFamilySerif};
  font-size: 12px;
  color: ${FLOW.textDim};
  text-transform: uppercase;
  letter-spacing: 1px;
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

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const ClickHint = styled.span`
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
  color: ${FLOW.textMuted};
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

export const SegmentIndicator = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

export const SegmentDot = styled.div<{ $active: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(p) => (p.$active ? FLOW.accent : FLOW.border)};
  transition: background 0.2s ease;
`;
