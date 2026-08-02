import styled from "styled-components";
import { FLOW, flowFadeIn } from "@/constants/flow-theme.constants";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  z-index: 1000;
  animation: ${flowFadeIn} 0.25s ease;
  cursor: pointer;
`;

export const ImageFrame = styled.div`
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 90vw;
  max-height: 80vh;

  img {
    max-width: 90vw;
    max-height: 80vh;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: ${FLOW.radius};
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
  }
`;

export const Caption = styled.div`
  cursor: default;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: ${FLOW.fontFamily};
  color: ${FLOW.textDim};
  font-size: 13px;
`;

export const CaptionName = styled.span`
  max-width: 60vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Counter = styled.span`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: ${FLOW.textMuted};
  font-variant-numeric: tabular-nums;
`;

// Left/right navigation arrows, pinned to the viewport edges and always visible.
export const NavButton = styled.button<{ $side: "left" | "right" }>`
  position: fixed;
  top: 50%;
  ${(p) => (p.$side === "left" ? "left: 24px" : "right: 24px")};
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(12, 12, 14, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: ${FLOW.text};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    opacity 0.18s ease;

  &:hover {
    background: rgba(212, 168, 83, 0.85);
    border-color: rgba(212, 168, 83, 0.85);
    color: ${FLOW.bg};
  }

  &:disabled {
    opacity: 0.2;
    cursor: default;
    /* Not pointer-events: none — that would let the click fall through to the
       overlay behind it and close the lightbox instead of doing nothing. */
  }
`;

export const CloseButton = styled.button`
  position: fixed;
  top: 20px;
  right: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(12, 12, 14, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: ${FLOW.text};
  font-size: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  transition: background 0.18s ease;

  &:hover {
    background: rgba(212, 168, 83, 0.85);
    color: ${FLOW.bg};
  }
`;
