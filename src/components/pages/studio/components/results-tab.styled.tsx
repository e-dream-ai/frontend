import styled, { css } from "styled-components";

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

export const ResultCell = styled.td<{ $status?: string }>`
  padding: 0.5rem;
  text-align: center;
  border-bottom: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  position: relative;
  min-width: 120px;

  ${(props) =>
    props.$status === "processed" &&
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

export const UprezStarBadge = styled.button<{ $active?: boolean }>`
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  color: ${(props) => (props.$active ? "#f5c542" : "#888")};
`;

export const ActionBar = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

export const ScrollableGrid = styled.div`
  overflow-x: auto;
`;

export const TimeEstimate = styled.span`
  margin-right: 1rem;
  color: #888;
`;

export const ActionButton = styled.button<{
  $variant?: "primary" | "secondary";
}>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};

  ${(props) =>
    props.$variant === "primary"
      ? css`
          background: ${props.theme.colorPrimary};
          color: white;
          border-color: ${props.theme.colorPrimary};
        `
      : css`
          background: transparent;
          color: ${props.theme.textPrimaryColor};
        `}

  &:hover {
    filter: brightness(120%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
