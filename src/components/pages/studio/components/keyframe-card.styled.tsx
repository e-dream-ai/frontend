import styled, { css } from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const CardWrapper = styled.div<{
  $loop?: boolean;
  $isDragging?: boolean;
}>`
  flex-shrink: 0;
  width: 140px;
  height: 100px;
  border-radius: ${FLOW.radiusSm};
  overflow: hidden;
  border: 2px solid ${FLOW.border};
  position: relative;
  cursor: grab;
  transition:
    border-color 0.2s,
    opacity 0.2s,
    transform 0.2s;

  ${(props) =>
    props.$loop &&
    css`
      opacity: 0.5;
      cursor: default;
      border-style: dashed;
    `}

  ${(props) =>
    props.$isDragging &&
    css`
      opacity: 0.4;
      transform: scale(0.95);
    `}

  &:hover {
    border-color: ${(props) => (props.$loop ? FLOW.border : FLOW.borderHover)};
  }
`;

export const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const CardPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: linear-gradient(135deg, #1a1520, #1d1825);
  font-size: 11px;
  color: ${FLOW.textMuted};
`;

export const CardLabel = styled.div`
  position: absolute;
  bottom: 6px;
  left: 8px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 6px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
`;

export const LoopBadge = styled.span`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${FLOW.accent};
  opacity: 0.7;
`;

export const DeleteButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: ${FLOW.textMuted};
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;

  ${CardWrapper}:hover & {
    opacity: 1;
  }
`;
