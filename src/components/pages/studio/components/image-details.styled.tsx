import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";
import { AddBtn } from "./select-modal.styled";
import { DeleteBtn } from "./action-dialog.styled";

// Text on the left, buttons at its lower right.
export const Details = styled.div`
  cursor: default;
  display: flex;
  align-items: flex-end;
  gap: 20px;
  width: min(960px, 90vw);
  /* On top of the lightbox's own gap, to set it off from the image. */
  margin-top: 34px;
  font-family: ${FLOW.fontFamily};
`;

export const DetailsText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

// The name, then its settings, on one line.
export const DetailsTitleLine = styled.div`
  display: flex;
  margin-bottom: 6px;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
`;

export const DetailsName = styled.span`
  flex: none;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  color: ${FLOW.text};
`;

// Long prompts scroll rather than push the image off the screen.
export const DetailsPrompt = styled.p`
  margin: 0;
  max-height: 4.5em;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.5;
  color: ${FLOW.text};
  white-space: pre-wrap;
  user-select: text;
`;

export const DetailsMeta = styled.p`
  margin: 0;
  font-size: 11px;
  color: ${FLOW.textDim};
`;

export const DetailsButtons = styled.div`
  display: flex;
  flex: none;
  gap: 8px;
`;

export const DetailsButton = styled(AddBtn)``;

export const DetailsDeleteButton = styled(DeleteBtn)`
  background: rgba(12, 12, 14, 0.6);
`;
