import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";
import { Panel, Body } from "./select-modal.styled";
import { FieldGroup } from "./transition-settings-panel.styled";

export const ActionDialogPanel = styled(Panel)`
  max-width: 560px;
`;

export const ActionDialogBody = styled(Body)`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const LoraField = styled(FieldGroup)`
  align-items: flex-start;
`;

export const ActionPromptText = styled.p`
  margin: 0;
  font-family: ${FLOW.fontFamily};
  font-size: 14px;
  line-height: 1.55;
  color: ${FLOW.text};
  white-space: pre-wrap;
  user-select: text;
`;

export const ActionMeta = styled.p`
  margin: 0;
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  color: ${FLOW.textDim};
`;

export const ImageDialogThumb = styled.img`
  display: block;
  max-width: 100%;
  max-height: 280px;
  object-fit: contain;
  align-self: center;
  border-radius: 6px;
`;
