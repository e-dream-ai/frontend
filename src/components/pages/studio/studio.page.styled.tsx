import styled from "styled-components";
import { Link } from "react-router-dom";
import { FLOW } from "@/constants/flow-theme.constants";
import type { StudioMode } from "@/types/flow.types";
import { EDITOR_BADGE } from "@/constants/editor-badge.constants";

export const StudioContainer = styled.div<{ $dragOver?: boolean }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${FLOW.bg};
  transition: outline-color 0.2s;
  outline: 2px solid transparent;
  outline-offset: -2px;

  ${(props) =>
    props.$dragOver &&
    `
    outline-color: ${FLOW.accent};
  `}
`;

export const StudioHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid ${FLOW.border};
  gap: 16px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    flex-wrap: wrap;
    padding: 10px 14px;
    gap: 10px;
  }
`;

export const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const LogoLink = styled(Link)`
  display: flex;
  flex-shrink: 0;
`;

export const Logo = styled.img`
  width: 32px;
  height: 32px;
  border-radius: ${FLOW.radiusSm};
  object-fit: contain;
  flex-shrink: 0;
`;

export const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border-radius: ${FLOW.radiusSm};
  border: 1px solid ${FLOW.border};
  background: transparent;
  color: ${FLOW.textDim};
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    border-color: ${FLOW.borderHover};
    color: ${FLOW.text};
  }

  @media (max-width: 480px) {
    padding: 0;
    width: 32px;

    span {
      display: none;
    }
  }
`;

export const StudioTitle = styled.h1`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  white-space: nowrap;
`;

export const EditorBadge = styled.span<{ $mode: StudioMode }>`
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 3px 7px;
  border-radius: 4px;
  background: ${(p) => EDITOR_BADGE[p.$mode] ?? FLOW.textDim};
  color: ${FLOW.bg};
  flex-shrink: 0;
`;

export const HeaderSpacer = styled.div`
  flex: 1;
`;

export const NewSessionButton = styled.button`
  background: transparent;
  border: 1px solid ${FLOW.border};
  color: ${FLOW.textDim};
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-family: ${FLOW.fontFamily};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${FLOW.borderHover};
    color: ${FLOW.text};
  }
`;

export const StudioBody = styled.div`
  flex: 1;
  overflow-y: auto;
  width: 100%;
  padding: 1.5rem 20px;
  position: relative;
`;

export const BodyOverlay = styled.div`
  position: absolute;
  inset: 0;
  padding: 1.5rem 20px;
  background: ${FLOW.bg};
`;

/**
 * The card both studios sit in. Flow used this shape already; the action app
 * now shares it rather than the old max-width:1200px column, so the two modes
 * fill the viewport identically and switching between them doesn't reflow.
 */
export const StudioFrame = styled.div<{ $dragOver?: boolean }>`
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  min-height: 200px;
  transition:
    border-color 0.2s,
    background-color 0.2s;

  ${(props) =>
    props.$dragOver &&
    `
    border-color: ${FLOW.accent};
    background-color: ${FLOW.accentDim};
  `}
`;

export const UprezFrame = styled(StudioFrame)`
  width: 100%;
  max-width: 560px;
  margin-inline: auto;
`;
