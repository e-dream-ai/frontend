import styled, { keyframes } from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(6, 6, 8, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.18s ease;
`;

export const Panel = styled.div`
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: 16px;
  width: 90%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideUp} 0.22s cubic-bezier(0.16, 1, 0.3, 1);
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 14px;
  border-bottom: 1px solid ${FLOW.border};
`;

export const Title = styled.h3`
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${FLOW.textMuted};
  margin: 0;
`;

export const CloseBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: ${FLOW.bgInput};
  color: ${FLOW.textDim};
  font-size: 16px;
  cursor: pointer;
  transition: color 0.15s;
  &:hover {
    color: ${FLOW.text};
  }
`;

export const Body = styled.div`
  padding: 22px 22px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
`;

/** The crop viewport — a fixed aspect-ratio window; the image pans/zooms behind it. */
export const Frame = styled.div<{ $w: number; $h: number }>`
  position: relative;
  width: ${(p) => p.$w}px;
  height: ${(p) => p.$h}px;
  overflow: hidden;
  border-radius: ${FLOW.radiusSm};
  background: #000;
  cursor: grab;
  touch-action: none;
  box-shadow: 0 0 0 1px ${FLOW.border};
  &:active {
    cursor: grabbing;
  }
`;

export const FrameImg = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
  pointer-events: none;
  -webkit-user-drag: none;
`;

/** Rule-of-thirds grid drawn over the frame for framing guidance. */
export const Grid = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.22) 1px, transparent 1px),
    linear-gradient(to right, rgba(255, 255, 255, 0.22) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.22) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.22) 1px, transparent 1px);
  background-position:
    33.33% 0,
    66.66% 0,
    0 33.33%,
    0 66.66%;
  background-size:
    1px 100%,
    1px 100%,
    100% 1px,
    100% 1px;
  background-repeat: no-repeat;
`;

export const ZoomRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  color: ${FLOW.textDim};
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
`;

export const ZoomSlider = styled.input`
  flex: 1;
  accent-color: ${FLOW.accent};
  cursor: pointer;
`;

export const Hint = styled.p`
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
  color: ${FLOW.textMuted};
  margin: 0;
  text-align: center;
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px 20px;
`;

export const ResetBtn = styled.button`
  background: none;
  border: none;
  color: ${FLOW.textDim};
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  cursor: pointer;
  &:hover {
    color: ${FLOW.text};
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

export const SecondaryBtn = styled.button`
  background: ${FLOW.bgInput};
  border: 1px solid ${FLOW.border};
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: ${FLOW.radiusSm};
  cursor: pointer;
  &:hover {
    border-color: ${FLOW.borderHover};
  }
`;

export const PrimaryBtn = styled.button`
  background: ${FLOW.accent};
  border: 1px solid ${FLOW.accent};
  color: #1a1408;
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  font-weight: 700;
  padding: 8px 18px;
  border-radius: ${FLOW.radiusSm};
  cursor: pointer;
  transition: filter 0.15s;
  &:hover {
    filter: brightness(1.08);
  }
`;
