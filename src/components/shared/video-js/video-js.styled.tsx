import {
  LONG_CROSSFADE_DURATION,
  SHORT_CROSSFADE_DURATION,
} from "@/constants/video-js.constants";
import styled from "styled-components";

export const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 1024px;
  aspect-ratio: 16 / 9;

  &:fullscreen {
    background: black; /* optional, for better aesthetics */
  }
`;

export const VideoContainer = styled.div<{
  isActive: boolean;
  skipCrossfade: boolean;
  longTransition: boolean;
}>`
  position: absolute;
  width: 100%;
  height: 100%;
  transition: ${({ skipCrossfade, longTransition }) =>
    skipCrossfade
      ? "opacity 0s linear"
      : `opacity ${
          (longTransition
            ? LONG_CROSSFADE_DURATION
            : SHORT_CROSSFADE_DURATION) * 1000
        }ms ease`};
  opacity: ${(props) => (props.isActive ? 1 : 0)};
  z-index: ${(props) => (props.isActive ? 2 : 1)};

  .video-js {
    width: 100% !important;
    height: 100% !important;

    // forces to videojs to respect dimensions
    &.vjs-fluid,
    &.vjs-16-9,
    &.vjs-4-3 {
      padding-top: 0 !important;
    }

    // video element style
    .vjs-tech {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      top: 0;
      left: 0;
    }
  }
`;

export const PlayerWrapper = styled.div``;

export const CloseButton = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  border: none;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;
