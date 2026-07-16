import styled, { keyframes } from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const SpinningIcon = styled.span`
  display: inline-flex;
  svg {
    animation: ${spin} 1.4s linear infinite;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${FLOW.border};
`;

export const ModalTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${FLOW.textDim};
  font-size: 1.25rem;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: ${FLOW.text};
  }
`;

export const ModalBody = styled.div`
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
`;

export const ModeToggleRow = styled.div`
  display: flex;
  background: ${FLOW.bg};
  border: 1px solid ${FLOW.border};
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
  margin-bottom: 1rem;
`;

export const ModeTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-family: ${FLOW.fontFamily};
  color: ${(p) => (p.$active ? FLOW.text : FLOW.textMuted)};
  background: ${(p) => (p.$active ? FLOW.bgElevated : "transparent")};
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${FLOW.text};
  }
`;

export const NameInput = styled.input`
  width: 100%;
  background: ${FLOW.bgInput};
  border: 1px solid ${FLOW.border};
  border-radius: 6px;
  padding: 9px 12px;
  color: ${FLOW.text};
  font-size: 14px;
  font-family: ${FLOW.fontFamily};
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${FLOW.accent};
  }
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 14px;
  color: ${FLOW.textDim};
  cursor: pointer;
`;

export const UprezParams = styled.div`
  margin-top: 12px;
  margin-left: 26px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

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

  &:hover {
    color: ${(p) => (p.$active ? FLOW.bg : FLOW.text)};
  }
`;

export const PlaylistList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 280px;
  overflow-y: auto;
`;

export const PlaylistItem = styled.button<{ $selected: boolean }>`
  display: block;
  width: 100%;
  text-align: left;
  background: ${(p) => (p.$selected ? FLOW.accentDim : "transparent")};
  border: 1px solid ${(p) => (p.$selected ? FLOW.accent : FLOW.border)};
  border-radius: 6px;
  padding: 10px 12px;
  color: ${(p) => (p.$selected ? FLOW.accent : FLOW.textDim)};
  font-size: 13px;
  font-family: ${FLOW.fontFamily};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${FLOW.borderHover};
    color: ${FLOW.text};
  }
`;

export const Summary = styled.p`
  font-size: 12px;
  color: ${FLOW.textMuted};
  margin-top: 1rem;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 1rem 1.25rem;
  border-top: 1px solid ${FLOW.border};
`;

export const CancelButton = styled.button`
  background: transparent;
  border: 1px solid ${FLOW.border};
  color: ${FLOW.textDim};
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-family: ${FLOW.fontFamily};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${FLOW.borderHover};
    color: ${FLOW.text};
  }
`;

export const SaveButton = styled.button`
  background: ${FLOW.accent};
  color: ${FLOW.bg};
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  font-family: ${FLOW.fontFamily};
  padding: 8px 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #e0b45e;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
