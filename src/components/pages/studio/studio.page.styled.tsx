import styled from "styled-components";
import { Link } from "react-router-dom";
import { FLOW } from "@/constants/flow-theme.constants";

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

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${FLOW.radiusSm};
  border: 1px solid ${FLOW.border};
  background: transparent;
  color: ${FLOW.textDim};
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    border-color: ${FLOW.borderHover};
    color: ${FLOW.text};
  }
`;

export const StudioTitle = styled.h1`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
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

export const ModeToggle = styled.div`
  display: flex;
  background: ${FLOW.bg};
  border: 1px solid ${FLOW.border};
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
`;

export const ModeButton = styled.button<{ $active: boolean }>`
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-family: ${FLOW.fontFamily};
  color: ${(props) => (props.$active ? FLOW.text : FLOW.textMuted)};
  background: ${(props) => (props.$active ? FLOW.bgElevated : "transparent")};
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${FLOW.text};
  }
`;
