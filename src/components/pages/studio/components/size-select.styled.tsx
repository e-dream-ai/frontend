import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const Wrapper = styled.div`
  position: relative;
`;

export const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  appearance: none;
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

export const Dropdown = styled.ul`
  position: fixed;
  margin: 0;
  padding: 4px;
  list-style: none;
  background-color: ${FLOW.bgElevated};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  /* Above the modal overlay (z-index 1000) since the menu portals to body. */
  z-index: 1100;
`;

export const OptionRow = styled.li<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
  padding: 6px 12px;
  border-radius: 6px;
  color: ${(p) => (p.$selected ? FLOW.accent : FLOW.text)};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background-color: ${FLOW.accentDim};
  }
`;

export const RatioRect = styled.span`
  display: inline-block;
  flex-shrink: 0;
  margin-left: auto;
  border: 1.5px solid currentColor;
  border-radius: 2px;
  opacity: 0.85;
`;
