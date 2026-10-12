import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import { FLOW, flowSlideIn } from "@/constants/flow-theme.constants";
import { ActionButton } from "./playlist-actions.styled";
import { Button } from "./project-dialog.styled";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Trigger = styled(ActionButton)`
  border-color: ${FLOW.borderHover};
  background: ${FLOW.bgElevated};
  color: ${FLOW.text};
  white-space: nowrap;

  &:hover:not(:disabled),
  &[aria-expanded="true"] {
    border-color: ${FLOW.accent};
  }
`;

export const Panel = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 20;
  width: min(280px, calc(100vw - 28px));
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radius};
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45);
  font-family: ${FLOW.fontFamily};
  animation: ${flowSlideIn} 0.16s ease;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Owner = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px;
  margin: -6px;
  border-radius: ${FLOW.radiusSm};
  text-decoration: none;
  color: ${FLOW.text};

  &:hover {
    background: ${FLOW.bg};
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 2px;
  }
`;

export const OwnerText = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const OwnerName = styled.span`
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const OwnerRole = styled.span`
  font-size: 11px;
  color: ${FLOW.textMuted};
`;

export const Text = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: ${FLOW.textDim};
`;

export const RemixButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;

  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }
`;

export const Spinner = styled.span`
  display: flex;
  animation: ${spin} 0.9s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 2.4s;
  }
`;
