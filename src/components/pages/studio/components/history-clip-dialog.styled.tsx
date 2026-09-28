import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";
import { Panel, Body } from "./select-modal.styled";
import { ratioBox } from "../utils/ratio-box";

export const HistoryClipPanel = styled(Panel)`
  width: 92%;
  max-width: 1000px;
  max-height: 92vh;
`;

export const HistoryClipBody = styled(Body)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
`;

export const HistoryClipVideo = styled.div<{ $ratio?: string }>`
  ${(p) => ratioBox(p.$ratio, ["100%", "960px"], "60vh")}
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${FLOW.radiusSm};
  overflow: hidden;
  background: #000;
  color: ${FLOW.textDim};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const HistoryClipInfo = styled.dl`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 6px 16px;
  width: 100%;
  margin: 0;
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  line-height: 1.45;

  dt {
    color: ${FLOW.textMuted};
  }

  dd {
    margin: 0;
    color: ${FLOW.text};
    user-select: text;
  }
`;

export const HistoryClipNote = styled.p`
  width: 100%;
  margin: 0;
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  color: ${FLOW.textDim};

  &:empty {
    display: none;
  }
`;
