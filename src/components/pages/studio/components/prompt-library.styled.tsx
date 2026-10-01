import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";
import { Panel, SearchRow, SkeletonCard } from "./select-modal.styled";
import { Select } from "./transition-settings-panel.styled";

export const PromptTools = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

export const PromptToolButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: transparent;
  border: 1px solid ${FLOW.border};
  border-radius: 999px;
  color: ${FLOW.textDim};
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;

  &:hover {
    border-color: ${FLOW.accent};
    color: ${FLOW.text};
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 2px;
  }
`;

export const LibraryPanel = styled(Panel)`
  max-width: 920px;
  height: 82vh;
`;

const CONTROL_HEIGHT = "34px";

export const Toolbar = styled(SearchRow)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

export const LibrarySearchField = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1 1 180px;

  & > input {
    height: ${CONTROL_HEIGHT};
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 32px;
    padding-right: 32px;
  }
`;

export const LibrarySearchIcon = styled.span`
  position: absolute;
  left: 11px;
  display: flex;
  color: ${FLOW.textMuted};
  pointer-events: none;
`;

export const LibrarySearchClear = styled.button`
  position: absolute;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: ${FLOW.textMuted};
  cursor: pointer;

  &:hover {
    color: ${FLOW.text};
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 1px;
  }
`;

export const ToolbarSelect = styled(Select)`
  box-sizing: border-box;
  height: ${CONTROL_HEIGHT};
  min-width: 150px;
  padding-top: 0;
  padding-bottom: 0;
`;

export const Segmented = styled.div`
  box-sizing: border-box;
  display: inline-flex;
  height: ${CONTROL_HEIGHT};
  padding: 2px;
  background: ${FLOW.bgInput};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
`;

export const ToggleButton = styled.button`
  padding: 0 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: ${FLOW.textMuted};
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;

  &[aria-pressed="true"] {
    background: ${FLOW.accentDim};
    border-color: ${FLOW.accent};
    color: ${FLOW.text};
  }

  &:not([aria-pressed="true"]):hover {
    color: ${FLOW.text};
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 1px;
  }
`;

export const ToggleChip = styled(ToggleButton)`
  box-sizing: border-box;
  height: ${CONTROL_HEIGHT};
  padding: 0 14px;
  border-color: ${FLOW.border};
  border-radius: 999px;
`;

export const LibraryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  align-items: start;
`;

export const DiffKey = styled.ul`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 18px;
  margin: 0 0 14px;
  padding: 0;
  list-style: none;
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
  color: ${FLOW.textMuted};
`;

export const DiffKeyItem = styled.li`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const DiffKeyRail = styled.span`
  width: 2px;
  height: 14px;
  border-radius: 1px;
  background: ${FLOW.accent};
  opacity: 0.6;
`;

const ROW_GAP = 6;
const ROW_INSET = 11;
const THUMB_SIZE = 56;

export const HistoryList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${ROW_GAP}px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const HistoryItem = styled.li<{ $linkedBelow?: boolean }>`
  position: relative;

  &::after {
    content: "";
    display: ${(p) => (p.$linkedBelow ? "block" : "none")};
    position: absolute;
    left: ${ROW_INSET + THUMB_SIZE / 2 - 1}px;
    top: ${ROW_INSET + THUMB_SIZE}px;
    height: calc(100% - ${THUMB_SIZE - ROW_GAP}px);
    width: 2px;
    border-radius: 1px;
    background: ${FLOW.accent};
    opacity: 0.6;
    pointer-events: none;
  }
`;

export const SkeletonRow = styled(SkeletonCard)`
  aspect-ratio: auto;
  height: 78px;
`;

export const HistoryRow = styled.button`
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 12px;
  width: 100%;
  padding: 10px;
  background: ${FLOW.bgElevated};
  border: 1px solid transparent;
  border-radius: ${FLOW.radiusSm};
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s;

  &:hover {
    border-color: ${FLOW.borderHover};
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 2px;
  }
`;

export const HistoryThumb = styled.img`
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
  background: ${FLOW.bgInput};
`;

export const HistoryText = styled.span`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  font-family: ${FLOW.fontFamily};
`;

export const HistoryMeta = styled.span`
  font-size: 11px;
  color: ${FLOW.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const HistoryPrompt = styled.span`
  font-size: 13px;
  line-height: 1.55;
  color: ${FLOW.textDim};
  white-space: pre-wrap;
  word-break: break-word;
`;

const highlight = `
  padding: 1px 2px;
  border-radius: 3px;
  text-decoration: none;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
`;

export const AddedText = styled.mark`
  ${highlight}
  color: ${FLOW.success};
  background: ${FLOW.successDim};
`;

export const DroppedText = styled.mark`
  ${highlight}
  color: ${FLOW.error};
  background: ${FLOW.errorDim};
`;

export const AddedThenDroppedText = styled(DroppedText)`
  box-shadow: inset 0 -2px 0 ${FLOW.success};
`;
