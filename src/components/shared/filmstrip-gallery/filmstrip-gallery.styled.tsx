import styled from "styled-components";
import Text from "../text/text";

export const StyledFrameImage = styled.img<{ url?: string }>`
  min-width: 300px;
  max-width: 300px;
  height: auto;
  aspect-ratio: 16 / 9;
  background-repeat: no-repeat;
  background-position: left;
  background-size: cover;
  background-image: ${({ url }) => `url(${url})`};
  border: 0;
`;

export const ImageContainer = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
`;

export const OverlayText = styled(Text)`
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
`;
