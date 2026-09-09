import styled, { css } from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const ProgressBar = styled.div`
  border: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
`;

export const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

export const ProgressTrack = styled.div`
  height: 8px;
  background: ${(props) => props.theme.colorBackgroundQuaternary};
  border-radius: 4px;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${(props) => props.$percent}%;
  background: ${(props) => props.theme.colorPrimary};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

export const ResultCell = styled.td<{ $clickable?: boolean }>`
  padding: 0.5rem;
  text-align: center;
  border-bottom: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  position: relative;
  min-width: 120px;

  ${(props) =>
    props.$clickable &&
    css`
      cursor: pointer;
      &:hover {
        background: ${props.theme.colorBackgroundQuaternary};
      }
    `}
`;

export const ResultThumb = styled.div`
  position: relative;
  width: 100px;
  height: 56px;
  margin: 0 auto 0.25rem;
  border-radius: 4px;
  overflow: hidden;
  background: ${(props) => props.theme.colorBackgroundQuaternary};
`;

export const ResultThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const ResultCellStatus = styled.div<{ $color?: string }>`
  font-size: 0.6875rem;
  color: ${(props) => props.$color || props.theme.textBodyColor};
`;

export const ActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 20px ${FLOW.inset};
  flex-wrap: wrap;
  border-top: 1px solid ${FLOW.border};
`;

// Buttons sit in two clusters so navigation anchors the corners: "back" bottom
// left, "view playlist" bottom right, with any situational actions between.
export const ActionGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

export const ScrollableGrid = styled.div`
  overflow-x: auto;
`;

export const TimeEstimate = styled.span`
  margin-right: 1rem;
  color: #888;
`;

export const UprezSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  border-radius: 6px;
  background: ${(props) =>
    props.theme.colorBackgroundSecondary || "transparent"};
  color: ${(props) => props.theme.textPrimaryColor};
  font-size: 0.8125rem;
  cursor: pointer;
  width: auto;
  min-width: 180px;
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
