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
  width: 180px;
  max-width: 100%;
  padding: 6px 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.text};
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;

  &::placeholder {
    color: ${FLOW.textMuted};
  }

  &:hover:not(:disabled) {
    border-color: ${FLOW.border};
  }

  &:focus {
    outline: none;
    background: ${FLOW.bg};
    border-color: ${FLOW.accent};
  }

  &:disabled {
    color: ${FLOW.textMuted};
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    flex: 1;
    width: auto;
  }
`;
