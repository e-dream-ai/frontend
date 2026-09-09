import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import { FLOW, flowFadeSlideUp } from "@/constants/flow-theme.constants";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const SpinningIcon = styled.span`
  display: inline-flex;
  svg {
    animation: ${spin} 1.4s linear infinite;
  }
`;

export const AppBody = styled.div`
  padding: ${FLOW.inset};
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Intro = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: ${FLOW.textMuted};
  font-family: ${FLOW.fontFamily};
  max-width: 62ch;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 440px;
`;

export const SectionLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${FLOW.textMuted};
  font-family: ${FLOW.fontFamily};
`;

export const TextInput = styled.input`
  width: 100%;
  background: ${FLOW.bgInput};
  border: 1px solid ${FLOW.border};
  border-radius: 6px;
  padding: 9px 12px;
  color: ${FLOW.text};
  font-size: 13px;
  font-family: ${FLOW.fontFamily};
  transition: border-color 0.15s;

  &::placeholder {
    color: ${FLOW.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${FLOW.accent};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const EmptySource = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 440px;
  padding: 14px 14px;
  background: ${FLOW.bgInput};
  border: 1px dashed ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.textMuted};
  font-size: 13px;
  font-family: ${FLOW.fontFamily};
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${FLOW.accent};
    color: ${FLOW.text};
  }
`;

export const SourceCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: ${FLOW.bgElevated};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  max-width: 440px;
`;

export const SourceThumb = styled.img`
  width: 72px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 4px;
  background: ${FLOW.bg};
  flex-shrink: 0;
`;

export const SourceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const SourceName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SourceMeta = styled.span`
  font-size: 12px;
  color: ${FLOW.textDim};
  font-family: ${FLOW.fontFamily};
`;

export const LinkButton = styled.button`
  flex-shrink: 0;
  margin-left: auto;
  background: none;
  border: none;
  padding: 0;
  color: ${FLOW.accent};
  font-size: 12px;
  font-family: ${FLOW.fontFamily};
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: ${FLOW.text};
  }
`;

export const FactorFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
`;

export const PrimaryButton = styled.button`
  background: ${FLOW.accent};
  color: ${FLOW.bg};
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  font-family: ${FLOW.fontFamily};
  padding: 10px 22px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #e0b45e;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Hint = styled.span`
  font-size: 12px;
  color: ${FLOW.textMuted};
  font-family: ${FLOW.fontFamily};
`;

export const ResultPanel = styled.div<{ $error?: boolean }>`
  border: 1px solid ${(p) => (p.$error ? FLOW.error : FLOW.success)};
  background: ${(p) => (p.$error ? FLOW.errorDim : FLOW.successDim)};
  border-radius: ${FLOW.radiusSm};
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 440px;
  animation: ${flowFadeSlideUp} 0.2s ease-out;
`;

export const ResultTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
`;

export const ResultText = styled.span`
  font-size: 12px;
  color: ${FLOW.textDim};
  font-family: ${FLOW.fontFamily};
`;

export const ResultLink = styled(Link)`
  font-size: 12px;
  color: ${FLOW.accent};
  font-family: ${FLOW.fontFamily};
  text-decoration: underline;
  width: fit-content;

  &:hover {
    color: ${FLOW.text};
  }
`;
