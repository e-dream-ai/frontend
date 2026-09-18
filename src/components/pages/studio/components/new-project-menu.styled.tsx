import styled from "styled-components";
import { Link } from "react-router-dom";
import { FLOW } from "@/constants/flow-theme.constants";
import type { StudioMode } from "@/types/flow.types";
import { EDITOR_BADGE } from "../constants/editor-badge";

export const Anchor = styled.div`
  position: relative;
`;

export const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: ${FLOW.radiusSm};
  background: ${FLOW.accentDim};
  border: 1px solid ${FLOW.accent};
  color: ${FLOW.accent};
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: ${FLOW.accent};
    color: ${FLOW.bg};
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 2px;
  }
`;

export const Menu = styled.ul`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 20;
  min-width: 260px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radius};
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45);
  margin: 0;
  list-style: none;
`;

export const MenuItem = styled.li`
  display: contents;
`;

export const Item = styled(Link)<{ $mode: StudioMode }>`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  column-gap: 10px;
  row-gap: 2px;
  padding: 9px 10px;
  border-radius: ${FLOW.radiusSm};
  text-decoration: none;
  color: ${FLOW.text};

  &::before {
    content: "";
    grid-row: 1 / span 2;
    width: 8px;
    height: 8px;
    margin-top: 5px;
    border-radius: 2px;
    background: ${(p) => EDITOR_BADGE[p.$mode]};
  }

  &:hover,
  &:focus-visible {
    background: ${FLOW.bg};
    outline: none;
  }

  &:focus-visible {
    box-shadow: inset 0 0 0 1px ${FLOW.accent};
  }
`;

export const ItemName = styled.span`
  font-size: 13px;
  font-weight: 600;
`;

export const ItemHint = styled.span`
  grid-column: 2;
  font-size: 11px;
  line-height: 1.4;
  color: ${FLOW.textMuted};
`;
