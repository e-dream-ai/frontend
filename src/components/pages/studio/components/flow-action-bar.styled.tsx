import styled, { keyframes } from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

const shimmer = keyframes`
  0%   { background-position: -120px 0; }
  100% { background-position: 100% 0; }
`;

const softPulse = keyframes`
  0%, 100% { opacity: 0.85; }
  50%      { opacity: 1; }
`;

export const ActionBarContainer = styled.div`
  display: flex;
  gap: 10px;
  padding: 20px 28px;
  flex-wrap: wrap;
  border-top: 1px solid ${FLOW.border};
`;

export const ActionButton = styled.button<{ $accent?: boolean }>`
  background: ${(p) => (p.$accent ? FLOW.accentDim : FLOW.bgElevated)};
  color: ${(p) => (p.$accent ? FLOW.accent : FLOW.textDim)};
  border: 1px solid ${(p) => (p.$accent ? FLOW.accent : FLOW.border)};
  border-radius: ${FLOW.radiusSm};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(p) => (p.$accent ? FLOW.accent : FLOW.borderHover)};
    color: ${(p) => (p.$accent ? FLOW.bg : FLOW.text)};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const UprezDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

export const DropdownMenu = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 6px;
  background: ${FLOW.bgElevated};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  min-width: 200px;
  z-index: 10;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
`;

export const DropdownItem = styled.button`
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  padding: 10px 16px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${FLOW.bgInput};
  }
`;

// === Uprez progress button ===
// Renders a filled progress bar inside the button, with a slow shimmer
// over the filled portion. Content sits above via z-index.

export const UprezProgressButton = styled.button<{ $percent: number }>`
  position: relative;
  isolation: isolate;
  overflow: hidden;

  background: transparent;
  color: ${FLOW.accent};
  border: 1px solid ${FLOW.accent};
  border-radius: ${FLOW.radiusSm};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  padding: 8px 16px;
  cursor: default;
  min-width: 200px;
  animation: ${softPulse} 2.2s ease-in-out infinite;

  /* Filled portion */
  &::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: ${(p) => Math.max(0, Math.min(100, p.$percent))}%;
    background: ${FLOW.accentDim};
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: -2;
  }

  /* Shimmer overlay riding the fill */
  &::after {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: ${(p) => Math.max(0, Math.min(100, p.$percent))}%;
    background-image: linear-gradient(
      90deg,
      transparent 0%,
      rgba(212, 168, 83, 0.22) 50%,
      transparent 100%
    );
    background-repeat: no-repeat;
    background-size: 120px 100%;
    animation: ${shimmer} 1.6s linear infinite;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: -1;
  }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const UprezButtonContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  svg {
    flex-shrink: 0;
  }

  svg.spin {
    animation: ${spin} 1.4s linear infinite;
  }
`;

export const UprezDivider = styled.span`
  width: 1px;
  height: 12px;
  background: currentColor;
  opacity: 0.35;
`;

export const UprezDoneBadge = styled.span`
  background: ${FLOW.accent};
  color: ${FLOW.bg};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
`;
