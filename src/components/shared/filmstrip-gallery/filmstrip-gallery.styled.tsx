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

  &:hover {
    .filmstrip-icon {
      color: ${(props) => props.theme.colorSecondary};
    }
  }
`;

export const OverlayText = styled(Text)`
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 4px;
`;

export const OverlayIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 0px 0.6rem;
  font-size: 1.2rem;
  color: ${(props) => props.theme.textPrimaryColor};

  svg {
    filter: drop-shadow(0.2rem 0.2rem 0.2rem #000);
  }
`;
