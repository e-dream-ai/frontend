import styled, { keyframes } from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";
import { delayedAppearance } from "@/styles/delayed-appearance";

const pulse = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.75; }
`;

export const SkeletonFrame = styled.div`
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 420px;

  ${delayedAppearance()}

  > * {
    animation: ${pulse} 1.4s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    > * {
      animation: none;
      opacity: 0.55;
    }
  }
`;

export const SkeletonBlock = styled.div<{ $height: number; $width?: string }>`
  height: ${(props) => props.$height}px;
  width: ${(props) => props.$width ?? "100%"};
  border-radius: ${FLOW.radiusSm};
  background: ${FLOW.border};
`;

export const SkeletonRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const SkeletonCards = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

export const SkeletonCard = styled.div`
  width: 120px;
  height: 120px;
  border-radius: ${FLOW.radiusSm};
  background: ${FLOW.border};
`;
