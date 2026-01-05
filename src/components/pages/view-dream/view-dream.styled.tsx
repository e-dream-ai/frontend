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

export const ErrorTextAreaGroup = styled.div`
  display: flex;
  flex-flow: column;
  margin-bottom: 1rem;
  border-collapse: separate;
`;

export const ErrorTextAreaRow = styled.div`
  display: inline-flex;
  border-collapse: separate;
  align-items: center;
`;

export const ErrorTextAreaBefore = styled.span`
  min-width: 40px;
  padding: 6px 12px;
  background: ${(props) => props.theme.inputBackgroundColor};
  color: ${(props) => props.theme.inputTextColorSecondary};
  text-align: center;
  align-self: stretch;
`;

export const ErrorTextArea = styled.div`
  width: 100%;
  width: -moz-available;
  width: -webkit-fill-available;
  width: fill-available;
  min-height: 2.5rem;
  max-height: 8rem;
  overflow-y: auto;
  padding: 0.375rem 0.75rem;
  border: 0;
  border-radius: 0;
  align-items: center;
  background: ${(props) => props.theme.inputBackgroundColor};
  color: ${(props) => props.theme.inputTextColorPrimary};
  font-size: 1rem;
  cursor: not-allowed;
  white-space: pre-wrap;
  word-break: break-word;
`;
