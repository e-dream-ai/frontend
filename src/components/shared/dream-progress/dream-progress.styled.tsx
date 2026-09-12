import ProgressBar from "@/components/shared/progress-bar/progress-bar";
import styled, { keyframes } from "styled-components";

const slide = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(300%); }
`;

export const ProgressContent = styled.div`
  display: grid;
  gap: 8px;
  width: 100%;
  min-width: 0;
  color: ${(p) => p.theme.textPrimaryColor};
  font-size: 0.8125rem;
  line-height: 1.5;

  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
    }
  }
`;

export const ProgressLabel = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2px 8px;
  font-variant-numeric: tabular-nums;
`;

export const ProgressStage = styled.span`
  font-weight: 600;
`;

export const ProgressPercent = styled.span`
  color: ${(p) => p.theme.textAccentColor};
  font-weight: 600;
`;

export const ProgressEta = styled.span`
  color: ${(p) => p.theme.textBodyColor};
  font-size: 0.75rem;
`;

export const ProgressMeter = styled(ProgressBar).attrs(({ theme }) => ({
  bgColor: theme.textAccentColor,
  baseBgColor: theme.inputBackgroundColor,
  transitionDuration: "0.3s",
}))``;

export const IndeterminateTrack = styled.div`
  height: 6px;
  overflow: hidden;
  border-radius: 4px;
  background: ${(p) => p.theme.inputBackgroundColor};

  span {
    display: block;
    width: 35%;
    height: 100%;
    background: ${(p) => p.theme.textAccentColor};
    border-radius: inherit;
    animation: ${slide} 1.8s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    span {
      animation: none;
      margin: auto;
    }
  }
`;

export const ProgressOverlay = styled.div`
  position: absolute;
  inset: auto 0 0;
  z-index: 1;
  padding: 28px 12px 12px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(0, 0, 0, 0.75) 40%,
    rgba(0, 0, 0, 0.92)
  );
  pointer-events: none;
`;

export const PlaylistSummary = styled.section`
  display: grid;
  gap: 8px;
  margin: 16px 0;
  padding: 8px 0;
  color: ${(p) => p.theme.textPrimaryColor};
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
`;

export const PlaylistProgressOverlayContainer = styled(ProgressOverlay)`
  ${PlaylistSummary} {
    margin: 0;
    padding: 0;
    font-size: 0.8125rem;
  }
`;
