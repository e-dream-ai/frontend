import styled, { css } from "styled-components";
import { FLOW, flowFadeSlideUp } from "@/constants/flow-theme.constants";

export const GapContainer = styled.div<{ $expanded: boolean }>`
  flex-shrink: 0;
  width: ${(p) => (p.$expanded ? "80px" : "64px")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: width 0.3s ease;
`;

export const GapLine = styled.div<{
  $configured: boolean;
  $failed: boolean;
}>`
  width: 32px;
  border-top: 2px dashed
    ${(p) =>
      p.$failed ? "#ef4444" : p.$configured ? FLOW.accent : FLOW.border};
  transition: border-color 0.3s ease;
`;

export const GapThumbnail = styled.div<{ $status: string }>`
  width: 48px;
  height: 34px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  background: ${FLOW.bgCard};
  animation: ${flowFadeSlideUp} 0.4s ease;

  ${(p) =>
    p.$status === "failed" &&
    css`
      border: 1px solid #ef4444;
    `}

  ${(p) =>
    p.$status === "processed" &&
    css`
      border: 1px solid ${FLOW.success};
    `}

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const GapStatusLabel = styled.span<{ $status: string }>`
  font-size: 9px;
  font-family: ${FLOW.fontFamily};
  color: ${(p) => {
    switch (p.$status) {
      case "processed":
        return FLOW.success;
      case "processing":
        return FLOW.processing;
      case "failed":
        return "#ef4444";
      default:
        return FLOW.textMuted;
    }
  }};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const GapProgressBar = styled.div`
  width: 40px;
  height: 2px;
  background: ${FLOW.bgInput};
  border-radius: 1px;
  overflow: hidden;
`;

export const GapProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${(p) => p.$percent}%;
  background: ${FLOW.processing};
  transition: width 0.3s ease;
`;

export const DurationLabel = styled.span`
  font-size: 10px;
  font-family: ${FLOW.fontFamily};
  color: ${FLOW.accent};
`;

export const GapIcon = styled.span<{ $color: string }>`
  font-size: 14px;
  color: ${(p) => p.$color};
  line-height: 1;
`;
