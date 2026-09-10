import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const UprezParamRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const UprezParamLabel = styled.span`
  font-size: 13px;
  color: ${FLOW.textDim};
  font-family: ${FLOW.fontFamily};
`;

export const FactorToggleGroup = styled.div`
  display: flex;
  background: ${FLOW.bgInput};
  border: 1px solid ${FLOW.border};
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
`;

export const FactorToggle = styled.button<{ $active: boolean }>`
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  font-family: ${FLOW.fontFamily};
  color: ${(p) => (p.$active ? FLOW.bg : FLOW.textMuted)};
  background: ${(p) => (p.$active ? FLOW.accent : "transparent")};
  border: none;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    color: ${(p) => (p.$active ? FLOW.bg : FLOW.text)};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;
