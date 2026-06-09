import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const GridContainer = styled.div`
  padding: 12px 0;
  animation: fadeSlideUp 0.3s ease;

  @keyframes fadeSlideUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const Grid = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$columns}, 1fr);
  gap: 8px;
  max-width: 480px;
`;

export const GridCell = styled.div<{ $active?: boolean; $status?: string }>`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid ${(p) => (p.$active ? FLOW.accent : FLOW.border)};
  cursor: ${(p) => (p.$status === "processed" ? "pointer" : "default")};
  transition:
    border-color 0.2s,
    transform 0.2s;
  aspect-ratio: 16 / 9;

  &:hover {
    border-color: ${(p) =>
      p.$status === "processed" ? FLOW.accent : FLOW.borderHover};
    ${(p) => p.$status === "processed" && "transform: translateY(-1px);"}
  }
`;

export const GridCellImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const GridCellOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 500;
`;

export const QueuedOverlay = styled(GridCellOverlay)`
  background: ${FLOW.bgElevated};
  color: ${FLOW.textMuted};
`;

export const ProcessingOverlay = styled(GridCellOverlay)`
  background: rgba(0, 0, 0, 0.5);
  color: ${FLOW.processing};
`;

export const FailedOverlay = styled(GridCellOverlay)`
  background: rgba(0, 0, 0, 0.5);
  color: ${FLOW.error};
`;

export const ActiveBadge = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${FLOW.accent};
  color: ${FLOW.bg};
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const GridActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

export const GridActionButton = styled.button`
  padding: 6px 12px;
  background: ${FLOW.bgElevated};
  border: 1px solid ${FLOW.border};
  border-radius: 6px;
  color: ${FLOW.textDim};
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${FLOW.borderHover};
    color: ${FLOW.text};
  }
`;
