import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const ToastRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const UndoButton = styled.button`
  flex-shrink: 0;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: ${FLOW.accent};
  font: inherit;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${FLOW.accentDim};
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 1px;
  }
`;
