import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

/**
 * Labels in one column, toggle groups in the other. The groups share the
 * second column's left edge, so equal factors (1x, 2x, 4x) line up across
 * rows while each group stays as long as its own options.
 */
export const EnhanceFactorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  column-gap: 12px;
  row-gap: 14px;
`;

/** Lays its label and group straight into `EnhanceFactorGrid`'s columns. */
export const EnhanceParamRow = styled.div`
  display: contents;
`;

export const EnhanceParamLabel = styled.span`
  font-size: 13px;
  color: ${FLOW.textDim};
  font-family: ${FLOW.fontFamily};
`;

export const FactorToggleGroup = styled.div`
  display: flex;
  justify-self: start;
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
