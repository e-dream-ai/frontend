import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  position: relative;
  padding-bottom: 60px;
`;

export const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
`;

export const VideoContainer = styled.div<{ isActive: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  transition: opacity 1000ms ease;
  opacity: ${props => props.isActive ? 1 : 0};
  z-index: ${props => props.isActive ? 2 : 1};

  .video-js {
    position: absolute;
    width: 100%;
    height: 100%;
  }
`;

export const PlayerWrapper = styled.div``;