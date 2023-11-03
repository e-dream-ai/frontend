import styled from "styled-components";

export const ThumbnailPlaceholder = styled.div`
  min-width: 320px;
  min-height: 240px;
  aspect-ratio: 4 / 3;
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 6rem;
`;

export const ThumbnailContainer = styled.div<{ editMode?: boolean }>`
  position: relative;
`;

export const ThumbnailButtons = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
`;

export const ThumbnailOverlay = styled.div`
  position: absolute;
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.5);
  min-width: -webkit-fill-available;
  min-height: -webkit-fill-available;
`;

export const Thumbnail = styled.img<{ url?: string }>`
  min-width: 320px;
  min-height: 240px;
  width: 100%;
  height: 100%;
  aspect-ratio: 4 / 3;
  background-repeat: no-repeat;
  background-position: left;
  background-size: cover;
  background-image: ${({ url }) => `url(${url})`};
  border: 0;
`;
