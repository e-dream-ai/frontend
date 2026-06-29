import styled from "styled-components";
import { FLOW, flowFadeIn } from "@/constants/flow-theme.constants";

export const LightboxOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${flowFadeIn} 0.3s ease;
`;

export const LightboxContent = styled.div`
  width: 90vw;
  max-width: 720px;
  max-height: 85vh;
  overflow-y: auto;
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
`;

export const LightboxHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export const LightboxTitle = styled.h3`
  font-family: ${FLOW.fontFamily};
  font-size: 16px;
  font-weight: 500;
  color: ${FLOW.text};
  margin: 0;
`;

export const CloseButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: ${FLOW.bgElevated};
  color: ${FLOW.textMuted};
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${FLOW.bgInput};
    color: ${FLOW.text};
  }
`;

export const CurrentResult = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: ${FLOW.radiusSm};
  overflow: hidden;
  background: ${FLOW.bg};
  margin-bottom: 16px;

  video,
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const SectionLabel = styled.div`
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
  font-weight: 600;
  color: ${FLOW.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 12px;
`;

export const LightboxActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

export const LightboxButton = styled.button<{ $primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-family: ${FLOW.fontFamily};
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${(p) => (p.$primary ? FLOW.accent : FLOW.border)};
  background: ${(p) => (p.$primary ? FLOW.accentDim : FLOW.bgElevated)};
  color: ${(p) => (p.$primary ? FLOW.accent : FLOW.textDim)};

  &:hover {
    border-color: ${(p) => (p.$primary ? FLOW.accent : FLOW.borderHover)};
    color: ${(p) => (p.$primary ? FLOW.accent : FLOW.text)};
  }
`;
