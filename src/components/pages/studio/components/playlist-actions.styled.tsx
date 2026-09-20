import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const Group = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const SaveButton = styled.button`
  padding: 5px 13px;
  border-radius: ${FLOW.radiusSm};
  border: 1px solid ${FLOW.accent};
  background: ${FLOW.accentDim};
  color: ${FLOW.accent};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover:not(:disabled) {
    background: ${FLOW.accent};
    color: ${FLOW.bg};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 2px;
  }
`;

export const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: ${FLOW.radiusSm};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  font-weight: 500;
  border: 1px solid ${FLOW.border};
  background: transparent;
  color: ${FLOW.textDim};
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;

  &:hover {
    border-color: ${FLOW.borderHover};
    color: ${FLOW.text};
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 2px;
  }
`;
