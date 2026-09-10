import styled, { keyframes } from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

/**
 * The shell every studio "pick something from a grid" modal shares:
 * overlay, panel, header, search row, scrolling body and footer buttons.
 * Kept in one place so the picker modals stay visually identical.
 */

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
  max-width: 760px;
  max-height: 82vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideUp} 0.22s cubic-bezier(0.16, 1, 0.3, 1);
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px 16px;
  border-bottom: 1px solid ${FLOW.border};
  flex-shrink: 0;
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
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${FLOW.bgElevated};
  border: 1px solid ${FLOW.border};
  border-radius: 50%;
  color: ${FLOW.textDim};
  font-size: 16px;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1;

  &:hover {
    border-color: ${FLOW.borderHover};
    color: ${FLOW.text};
  }
`;

export const SearchRow = styled.div`
  padding: 14px 22px 12px;
  border-bottom: 1px solid ${FLOW.border};
  flex-shrink: 0;
`;

export const SearchInput = styled.input`
  width: 100%;
  background: ${FLOW.bgInput};
  border: 1px solid ${FLOW.border};
  border-radius: 8px;
  padding: 8px 12px;
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  color: ${FLOW.text};
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;

  &::placeholder {
    color: ${FLOW.textMuted};
  }

  &:focus {
    border-color: ${FLOW.accent};
  }
`;

export const Body = styled.div`
  padding: 16px 22px;
  overflow-y: auto;
  flex: 1;
`;

export const EmptyMsg = styled.p`
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  color: ${FLOW.textMuted};
  text-align: center;
  margin-top: 40px;
`;

const shimmer = keyframes`
  from { background-position: -200% 0; }
  to { background-position: 200% 0; }
`;

export const SkeletonCard = styled.div`
  aspect-ratio: 1;
  border-radius: 10px;
  background: linear-gradient(
    90deg,
    ${FLOW.bgElevated} 25%,
    ${FLOW.border} 50%,
    ${FLOW.bgElevated} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s infinite;
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px;
  border-top: 1px solid ${FLOW.border};
  flex-shrink: 0;
`;

export const CountLabel = styled.span`
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  color: ${FLOW.textDim};
`;

export const FooterButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const CancelBtn = styled.button`
  padding: 8px 16px;
  background: transparent;
  border: 1px solid ${FLOW.border};
  border-radius: 8px;
  color: ${FLOW.textDim};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${FLOW.borderHover};
    color: ${FLOW.text};
  }
`;

export const AddBtn = styled.button`
  padding: 8px 20px;
  background: ${FLOW.accent};
  border: none;
  border-radius: 8px;
  color: #000;
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    opacity: 0.85;
  }
`;

/** Marks the end of the grid; pagination triggers when it comes into view. */
export const Sentinel = styled.div`
  height: 1px;
`;

export const LoadingMore = styled.p`
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  color: ${FLOW.textMuted};
  text-align: center;
  padding: 12px 0 4px;
`;
