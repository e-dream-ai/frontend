import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const SwitcherContainer = styled.div`
  position: relative;
`;

export const SwitcherBar = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  max-width: 100%;
`;

export const TitleInput = styled.input`
  box-sizing: border-box;
  min-width: 1ch;
  max-width: 320px;
  background: transparent;
  border: none;
  outline: none;
  color: ${FLOW.text};
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  padding: 3px 2px;
  border-radius: 4px;
  text-overflow: ellipsis;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: ${FLOW.bgElevated};
  }
  &:focus {
    background: ${FLOW.bgElevated};
  }
  &::placeholder {
    color: ${FLOW.textMuted};
  }
  &:disabled {
    color: ${FLOW.textMuted};
    cursor: default;
  }
`;

// Hidden mirror used to measure the title text so the input can grow/shrink
// to fit its content. Must match TitleInput's font + horizontal padding.
export const TitleSizer = styled.span`
  position: absolute;
  top: 0;
  left: -9999px;
  visibility: hidden;
  white-space: pre;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  padding: 3px 2px;
`;

export const CaretButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  background: none;
  border: none;
  border-radius: 6px;
  color: ${FLOW.textDim};
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: ${FLOW.bgInput};
    color: ${FLOW.text};
  }
`;

export const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 100;
  min-width: 280px;
  max-height: 400px;
  overflow-y: auto;
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  padding: 8px;
`;

export const SessionItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  background: ${(p) => (p.$active ? FLOW.accentDim : "transparent")};

  &:hover {
    background: ${FLOW.bgElevated};
  }
`;

export const SessionThumb = styled.div`
  width: 36px;
  height: 24px;
  border-radius: 4px;
  overflow: hidden;
  background: ${FLOW.bgInput};
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const SessionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SessionName = styled.div`
  font-size: 13px;
  color: ${FLOW.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SessionMeta = styled.div`
  font-size: 11px;
  color: ${FLOW.textMuted};
`;

export const ModeBadge = styled.span`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${FLOW.bgInput};
  color: ${FLOW.textDim};
`;

export const DropdownActions = styled.div`
  border-top: 1px solid ${FLOW.border};
  margin-top: 4px;
  padding-top: 4px;
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  background: none;
  border: none;
  border-radius: 8px;
  color: ${FLOW.textDim};
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${FLOW.bgElevated};
    color: ${FLOW.text};
  }
`;
