import styled from "styled-components";
import { FLOW, flowFadeIn } from "@/constants/flow-theme.constants";

export const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: ${flowFadeIn} 0.15s ease both;
`;

export const DialogCard = styled.div`
  width: min(420px, 100%);
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radius};
  padding: 22px;
  font-family: ${FLOW.fontFamily};
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.55);
`;

export const DialogTitle = styled.h2`
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
  color: ${FLOW.text};
`;

export const DialogBody = styled.p`
  margin: 0 0 18px;
  font-size: 13px;
  line-height: 1.55;
  color: ${FLOW.textDim};
`;

export const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const DialogButtonBase = styled.button`
  padding: 8px 16px;
  border-radius: ${FLOW.radiusSm};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease;

  &:focus-visible {
    outline: 2px solid ${FLOW.selected};
    outline-offset: 2px;
  }
`;

/**
 * Both buttons wear the same neutral treatment. Confirming forces settings onto
 * transitions that disagree, so nothing here should read as the obvious answer
 * — the only emphasis in the dialog is the focus ring, and it starts on Cancel.
 */
const DialogButton = styled(DialogButtonBase)`
  background: transparent;
  border: 1px solid ${FLOW.border};
  color: ${FLOW.textDim};

  &:hover {
    border-color: ${FLOW.borderHover};
    color: ${FLOW.text};
  }
`;

export const CancelButton = DialogButton;
export const ConfirmButton = DialogButton;
