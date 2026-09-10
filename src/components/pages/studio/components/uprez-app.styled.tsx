import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import { FLOW, flowFadeSlideUp } from "@/constants/flow-theme.constants";
import {
  FactorToggle,
  FactorToggleGroup,
  UprezParamLabel,
  UprezParamRow,
} from "./uprez-factor-row.styled";

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
  gap: 24px;

  button:focus-visible,
  a:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 3px;
  }

  @media (max-width: 480px) {
    padding: 18px;
    gap: 18px;
  }
`;

export const AppHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const AppTitle = styled.h2`
  margin: 0;
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const Intro = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${FLOW.textMuted};
  font-family: ${FLOW.fontFamily};
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

export const SectionLabel = styled.label`
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${FLOW.textMuted};
  font-family: ${FLOW.fontFamily};
`;

export const TextInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  min-height: 44px;
  background: ${FLOW.bgInput};
  border: 1px solid ${FLOW.border};
  border-radius: 6px;
  padding: 9px 12px;
  color: ${FLOW.text};
  font-size: 13px;
  font-family: ${FLOW.fontFamily};
  transition: border-color 0.15s;

  @media (max-width: 480px) {
    min-height: 38px;
    padding: 8px 10px;
  }

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
  min-height: 52px;
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

  @media (max-width: 480px) {
    min-height: 40px;
    padding: 10px;
  }

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
  min-width: 0;
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
  gap: 14px;

  ${FactorToggleGroup} {
    flex-shrink: 0;
  }

  ${FactorToggle} {
    min-width: 40px;
    min-height: 36px;
  }

  @media (max-width: 480px) {
    gap: 10px;

    ${UprezParamRow} {
      gap: 8px;
    }

    ${UprezParamLabel} {
      font-size: 12px;
    }

    ${FactorToggle} {
      min-width: 32px;
      min-height: 32px;
      padding: 4px 6px;
      font-size: 12px;
    }
  }

  @media (max-width: 360px) {
    ${UprezParamRow} {
      align-items: flex-start;
      flex-direction: column;
      gap: 6px;
    }
  }
`;

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid ${FLOW.border};

  @media (max-width: 480px) {
    gap: 10px;
    padding-top: 14px;
  }
`;

export const PrimaryButton = styled.button`
  min-height: 44px;
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

  @media (max-width: 480px) {
    min-height: 40px;
    padding: 8px 16px;
  }

  &:hover:not(:disabled) {
    background: #e0b45e;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Hint = styled.span`
  text-align: center;
  line-height: 1.5;
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
  overflow-wrap: anywhere;
  animation: ${flowFadeSlideUp} 0.2s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
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
