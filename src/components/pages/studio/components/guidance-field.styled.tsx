import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const THUMB = 16;
const TRACK_INSET = THUMB / 2;
const HIT_HEIGHT = 32;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 400px;
  max-width: 100%;
  flex: 0 0 auto;
`;

export const Title = styled.span`
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
  line-height: 1.3;
  color: ${FLOW.textDim};
  margin-bottom: 8px;
`;

export const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  line-height: 18px;
`;

export const Param = styled.label`
  font-family: ${FLOW.fontFamilyMono};
  font-size: 10px;
  letter-spacing: 0.02em;
  color: ${FLOW.textMuted};
`;

export const Value = styled.span`
  font-family: ${FLOW.fontFamilyMono};
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: ${FLOW.accent};
`;

export const Rail = styled.div`
  position: relative;
  height: ${HIT_HEIGHT}px;
  margin: -${(HIT_HEIGHT - THUMB) / 2 - 2}px 0;
  touch-action: none;
`;

export const Track = styled.div<{ $notches: number }>`
  position: absolute;
  left: ${TRACK_INSET}px;
  right: ${TRACK_INSET}px;
  top: 50%;
  height: 3px;
  transform: translateY(-50%);
  border-radius: 2px;
  background-color: ${FLOW.bgInput};
  background-image: repeating-linear-gradient(
    to right,
    ${FLOW.borderHover} 0 1px,
    transparent 1px calc(100% / ${(p) => p.$notches})
  );
`;

export const Fill = styled.div<{ $percent: number }>`
  position: absolute;
  left: ${TRACK_INSET}px;
  top: 50%;
  height: 3px;
  transform: translateY(-50%);
  border-radius: 2px;
  background: ${FLOW.accent};
  width: calc((100% - ${THUMB}px) * ${(p) => p.$percent} / 100);
`;

export const Slider = styled.input`
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: ${HIT_HEIGHT}px;
  margin: 0;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: ${HIT_HEIGHT}px;
    background: transparent;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: ${THUMB}px;
    height: ${THUMB}px;
    margin-top: ${(HIT_HEIGHT - THUMB) / 2}px;
    border-radius: 50%;
    background: ${FLOW.accent};
    border: 2px solid ${FLOW.bg};
    box-shadow: 0 0 0 0 ${FLOW.accentDim};
    transition: box-shadow 0.15s ease;
  }

  &::-moz-range-track {
    height: ${HIT_HEIGHT}px;
    background: transparent;
  }

  &::-moz-range-thumb {
    width: ${THUMB - 4}px;
    height: ${THUMB - 4}px;
    border-radius: 50%;
    background: ${FLOW.accent};
    border: 2px solid ${FLOW.bg};
    box-shadow: 0 0 0 0 ${FLOW.accentDim};
    transition: box-shadow 0.15s ease;
  }

  &:hover::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px ${FLOW.accentGlow};
  }
  &:hover::-moz-range-thumb {
    box-shadow: 0 0 0 4px ${FLOW.accentGlow};
  }

  &:focus {
    outline: none;
  }

  &:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px ${FLOW.accentDim};
  }
  &:focus-visible::-moz-range-thumb {
    box-shadow: 0 0 0 4px ${FLOW.accentDim};
  }

  @media (prefers-reduced-motion: reduce) {
    &::-webkit-slider-thumb,
    &::-moz-range-thumb {
      transition: none;
    }
  }
`;

export const Bounds = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ${FLOW.fontFamilyMono};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: ${FLOW.textMuted};
`;
