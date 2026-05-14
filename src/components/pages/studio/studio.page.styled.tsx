import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const StudioContainer = styled.div<{ $dragOver?: boolean }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: calc(100vh - 80px);
  transition: outline-color 0.2s;
  outline: 2px solid transparent;
  outline-offset: -2px;
  border-radius: 12px;

  ${(props) =>
    props.$dragOver &&
    `
    outline-color: ${props.theme.colorPrimary};
  `}
`;

export const StudioHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

export const StudioTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${(props) => props.theme.textPrimaryColor};
`;

export const NewSessionButton = styled.button`
  background: transparent;
  border: 1px solid #555;
  color: #aaa;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  cursor: pointer;
`;

export const ModeToggle = styled.div`
  display: flex;
  background: ${FLOW.bg};
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
`;

export const ModeButton = styled.button<{ $active: boolean }>`
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-family: ${FLOW.fontFamily};
  color: ${(props) => (props.$active ? FLOW.text : FLOW.textMuted)};
  background: ${(props) => (props.$active ? FLOW.bgElevated : "transparent")};
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${FLOW.text};
  }
`;
