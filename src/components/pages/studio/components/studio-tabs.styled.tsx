import styled, { css } from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const TabBar = styled.div`
  display: flex;
  gap: 0;
  padding: 0 16px;
  border-bottom: 1px solid ${FLOW.border};
  overflow-x: auto;
`;

export const Tab = styled.button<{ $active: boolean; $badge?: number }>`
  padding: 14px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: ${FLOW.textMuted};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  position: relative;
  transition:
    color 0.15s,
    border-color 0.15s;

  ${(props) =>
    props.$active &&
    css`
      color: ${FLOW.accent};
      border-bottom-color: ${FLOW.accent};
    `}

  &:hover {
    color: ${(props) => (props.$active ? FLOW.accent : FLOW.text)};
  }

  ${(props) =>
    props.$badge &&
    props.$badge > 0 &&
    css`
      &::after {
        content: "${props.$badge}";
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        background: ${FLOW.accent};
        color: ${FLOW.bg};
        font-size: 0.625rem;
        border-radius: 50%;
        width: 1.125rem;
        height: 1.125rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `}
`;
