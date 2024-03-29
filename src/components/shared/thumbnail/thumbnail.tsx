import styled from "styled-components";
import { TypographyProps, typography } from "styled-system";

export const ThumbnailPlaceholder = styled.div<TypographyProps>`
  min-width: 320px;
  min-height: auto;
  aspect-ratio: 16 / 9;
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  ${typography}
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
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 9;
  background-repeat: no-repeat;
  background-position: left;
  background-size: cover;
  background-image: ${({ url }) => `url(${url})`};
  border: 0;
`;
