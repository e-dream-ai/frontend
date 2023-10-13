import styled from "styled-components";

export const Video = styled.video`
  width: 640px;
  height: 360px;
`;

export const Thumbnail = styled.img`
  max-width: 640px;
  height: auto;
`;

export const VideoPlaceholder = styled.div`
  width: 640px;
  height: 480px;
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 6rem;
`;

export const ThumbnailPlaceholder = styled.div`
  width: 640px;
  height: 480px;
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 6rem;
`;
