import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const StripSection = styled.div`
  padding: 28px;
`;

export const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${FLOW.textMuted};
  margin-bottom: 20px;
  font-family: ${FLOW.fontFamily};
`;

export const StripContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  overflow-x: auto;
  padding-bottom: 8px;
`;

export const TransitionGap = styled.div`
  flex-shrink: 0;
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

export const GapLine = styled.div`
  width: 32px;
  border-top: 2px dashed ${FLOW.border};
`;

export const StripControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
`;

export const AddButtons = styled.div`
  display: flex;
  gap: 10px;
`;

export const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: ${FLOW.bgElevated};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.textDim};
  font-size: 13px;
  cursor: pointer;
  font-family: ${FLOW.fontFamily};
  transition: all 0.2s;

  &:hover {
    border-color: ${FLOW.borderHover};
    color: ${FLOW.text};
  }
`;

export const AddButtonPlus = styled.span`
  font-size: 15px;
  color: ${FLOW.accent};
`;

export const LoopToggle = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${FLOW.textDim};
  cursor: pointer;
  user-select: none;
  font-family: ${FLOW.fontFamily};
`;

export const LoopCheckbox = styled.input`
  accent-color: ${FLOW.accent};
  cursor: pointer;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 48px 16px;
  color: ${FLOW.textDim};
  font-size: 14px;
`;
