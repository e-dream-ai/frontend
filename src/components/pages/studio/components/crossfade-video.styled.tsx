import styled, { css } from "styled-components";
import { flowFadeIn } from "@/constants/flow-theme.constants";

export const LayerStack = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
`;

export const VideoLayer = styled.video<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 1;
  z-index: ${(p) => (p.$visible ? 1 : 0)};
  ${(p) =>
    p.$visible &&
    css`
      animation: ${flowFadeIn} 0.45s ease;
    `};
`;
