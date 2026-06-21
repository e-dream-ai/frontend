import styled from "styled-components";
import { FLOW, flowSlideIn } from "@/constants/flow-theme.constants";

export const SwitcherContainer = styled.div`
  position: relative;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 100%;
    order: 10;
  }
`;

export const Trigger = styled.button<{ $open?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 240px;
  padding: 6px 10px;
  background: ${(p) => (p.$open ? FLOW.bgElevated : "transparent")};
  border: 1px solid ${(p) => (p.$open ? FLOW.borderHover : "transparent")};
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.text};
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;

  &:hover {
    background: ${FLOW.bgElevated};
    border-color: ${FLOW.border};
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: 100%;
    font-size: 12px;
    padding: 5px 8px;
    justify-content: space-between;
    background: ${FLOW.bgElevated};
    border-color: ${FLOW.border};
  }
`;

export const TriggerLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const TriggerCaret = styled.span<{ $open?: boolean }>`
  display: flex;
  align-items: center;
  color: ${FLOW.textDim};
  transition: transform 0.18s ease;
  transform: rotate(${(p) => (p.$open ? "180deg" : "0deg")});
  flex-shrink: 0;
`;

export const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 100;
  width: 320px;
  max-width: calc(100vw - 24px);
  display: flex;
  flex-direction: column;
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radius};
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: ${flowSlideIn} 0.16s ease;

  @media (max-width: 480px) {
    left: 0;
    right: 0;
    width: auto;
  }
`;

export const DropdownHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 12px 14px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${FLOW.textMuted};
`;

export const DropdownCount = styled.span`
  font-weight: 500;
  letter-spacing: 0.04em;
`;

export const SessionList = styled.div`
  flex: 1;
  min-height: 0;
  max-height: min(360px, 50vh);
  overflow-y: auto;
  padding: 4px 6px;
`;

export const SessionItem = styled.div<{ $active?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px 8px 12px;
  border-radius: ${FLOW.radiusSm};
  cursor: pointer;
  transition: background 0.12s;
  background: ${(p) => (p.$active ? FLOW.accentDim : "transparent")};

  &:hover {
    background: ${(p) => (p.$active ? FLOW.accentDim : FLOW.bgElevated)};
  }
`;

export const SessionThumb = styled.div`
  width: 44px;
  height: 30px;
  border-radius: 5px;
  overflow: hidden;
  background: ${FLOW.bgInput};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${FLOW.textMuted};

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
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
  font-size: 11px;
  color: ${FLOW.textMuted};
`;

export const ModeBadge = styled.span<{ $mode?: "flow" | "batch" }>`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${(p) => (p.$mode === "flow" ? FLOW.accentDim : FLOW.bgInput)};
  color: ${(p) => (p.$mode === "flow" ? FLOW.accent : FLOW.textDim)};
`;

export const RenameInput = styled.input`
  width: 100%;
  background: ${FLOW.bg};
  border: 1px solid ${FLOW.accent};
  border-radius: 5px;
  color: ${FLOW.text};
  font-family: inherit;
  font-size: 13px;
  padding: 3px 6px;
  outline: none;
`;

export const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.12s;

  ${SessionItem}:hover & {
    opacity: 1;
  }

  @media (hover: none), (pointer: coarse) {
    opacity: 1;
  }
`;

export const IconButton = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: none;
  border: none;
  border-radius: 6px;
  color: ${FLOW.textDim};
  cursor: pointer;
  transition:
    background 0.12s,
    color 0.12s;

  &:hover {
    background: ${(p) => (p.$danger ? FLOW.errorDim : FLOW.bgInput)};
    color: ${(p) => (p.$danger ? FLOW.error : FLOW.text)};
  }
`;

export const DropdownFooter = styled.div`
  border-top: 1px solid ${FLOW.border};
  padding: 6px;
`;

export const NewSessionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 10px;
  background: none;
  border: none;
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.accent};
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.12s;

  &:hover {
    background: ${FLOW.accentDim};
  }
`;
