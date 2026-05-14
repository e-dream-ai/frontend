import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const ActionBarContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

export const ActionButton = styled.button<{ $accent?: boolean }>`
  background: ${(p) => (p.$accent ? FLOW.accentDim : FLOW.bgElevated)};
  color: ${(p) => (p.$accent ? FLOW.accent : FLOW.textDim)};
  border: 1px solid ${(p) => (p.$accent ? FLOW.accent : FLOW.border)};
  border-radius: ${FLOW.radiusSm};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(p) => (p.$accent ? FLOW.accent : FLOW.borderHover)};
    color: ${(p) => (p.$accent ? FLOW.bg : FLOW.text)};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const UprezDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: ${FLOW.bgElevated};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  min-width: 200px;
  z-index: 10;
  overflow: hidden;
`;

export const DropdownItem = styled.button`
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  padding: 10px 16px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${FLOW.bgInput};
  }
`;
