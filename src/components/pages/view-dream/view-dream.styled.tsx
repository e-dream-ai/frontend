import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

export const Video = styled.video`
  width: 640px;
  height: 360px;

  @media (max-width: ${DEVICES.TABLET}) {
    width: 90vw;
    height: auto;
  }
`;

export const VideoPlaceholder = styled.div`
  min-width: 420px;
  min-height: auto;
  aspect-ratio: 16 / 9;
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;

  @media (max-width: ${DEVICES.TABLET}) {
    width: 90vw;
    height: auto;
  }
`;
