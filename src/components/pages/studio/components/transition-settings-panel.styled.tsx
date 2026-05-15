import styled from "styled-components";
import { FLOW, flowSlideIn } from "@/constants/flow-theme.constants";

export const PanelContainer = styled.div`
  padding: 24px 28px;
  border-top: 1px solid ${FLOW.border};
  animation: ${flowSlideIn} 0.4s ease;
`;

export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const PanelTitle = styled.span`
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
  font-weight: 600;
  color: ${FLOW.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

export const PanelSubtitle = styled.span`
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  color: ${FLOW.textDim};
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${FLOW.textDim};
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  line-height: 1;

  &:hover {
    color: ${FLOW.text};
  }
`;

export const FieldRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const FieldLabel = styled.label`
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
  color: ${FLOW.textDim};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const Select = styled.select`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: ${FLOW.bgInput};
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'><path d='M1 1l4 4 4-4' stroke='%238a8890' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  padding: 6px 32px 6px 12px;
  cursor: pointer;
  min-width: 140px;

  &:hover {
    border-color: ${FLOW.borderHover};
  }

  &:focus {
    outline: none;
    border-color: ${FLOW.accent};
  }
`;

export const PromptTextarea = styled.textarea<{ $invalid?: boolean }>`
  background: ${FLOW.bgInput};
  border: 1px solid ${(p) => (p.$invalid ? FLOW.error : FLOW.border)};
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  padding: 10px 12px;
  width: 100%;
  min-height: 120px;
  resize: none;
  transition: border-color 0.18s ease;

  &:hover {
    border-color: ${(p) => (p.$invalid ? FLOW.error : FLOW.borderHover)};
  }

  &:focus {
    outline: none;
    border-color: ${(p) => (p.$invalid ? FLOW.error : FLOW.accent)};
  }

  &::placeholder {
    color: ${FLOW.textMuted};
  }
`;

export const RequiredMark = styled.span`
  color: ${FLOW.error};
  margin-left: 4px;
`;

export const ValidationHint = styled.div`
  margin-top: 10px;
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
  color: ${FLOW.error};
  letter-spacing: 0.04em;
`;

export const GenerateButton = styled.button<{ $disabled?: boolean }>`
  background: ${(p) => (p.$disabled ? FLOW.bgInput : FLOW.accentDim)};
  color: ${(p) => (p.$disabled ? FLOW.textMuted : FLOW.accent)};
  border: 1px solid ${(p) => (p.$disabled ? FLOW.border : FLOW.accent)};
  border-radius: ${FLOW.radiusSm};
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  font-weight: 500;
  padding: 6px 14px;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: ${FLOW.accent};
    color: ${FLOW.bg};
  }
`;

export const ToggleLink = styled.button`
  background: none;
  border: none;
  color: ${FLOW.textDim};
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  margin-top: 8px;

  &:hover {
    color: ${FLOW.text};
  }
`;

export const ResetLink = styled.button`
  background: none;
  border: none;
  color: ${FLOW.textMuted};
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;

  &:hover {
    color: ${FLOW.textDim};
  }
`;

export const ExpandedSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${FLOW.border};
`;

export const AdvancedToggle = styled.button`
  background: none;
  border: none;
  color: ${FLOW.textMuted};
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  text-align: left;

  &:hover {
    color: ${FLOW.textDim};
  }
`;

export const AdvancedFields = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 8px 0;
`;

export const NumberInput = styled.input`
  background: ${FLOW.bgInput};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  padding: 6px 10px;
  width: 80px;

  &:hover {
    border-color: ${FLOW.borderHover};
  }

  &:focus {
    outline: none;
    border-color: ${FLOW.accent};
  }
`;
