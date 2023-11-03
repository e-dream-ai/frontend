import styled from "styled-components";

export const Video = styled.video`
  width: 640px;
  height: 360px;
`;

export const VideoPlaceholder = styled.div`
  min-width: 320px;
  min-height: 240px;
  aspect-ratio: 4 / 3;
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 6rem;
`;
