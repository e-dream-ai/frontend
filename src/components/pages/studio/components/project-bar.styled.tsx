import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  @media (max-width: 480px) {
    width: 100%;
    order: 9;
  }
`;

export const NameInput = styled.input`
  width: 196px;
  max-width: 100%;
  padding: 4px 8px;
  background: ${FLOW.bg};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-overflow: ellipsis;

  &::placeholder {
    color: ${FLOW.textMuted};
  }

  &:hover:not(:disabled) {
    border-color: ${FLOW.borderHover};
    background: ${FLOW.bgInput};
  }

  &:focus {
    outline: none;
    background: ${FLOW.bg};
    border-color: ${FLOW.accent};
  }

  &:disabled {
    background: transparent;
    border-style: dashed;
    color: ${FLOW.textMuted};
    cursor: default;
  }

  @media (max-width: 480px) {
    flex: 1;
    width: auto;
  }
`;
