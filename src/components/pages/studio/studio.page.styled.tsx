import styled from "styled-components";
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

export const HeaderSide = styled.div<{ $align: "left" | "right" }>`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  justify-content: ${(props) =>
    props.$align === "right" ? "flex-end" : "flex-start"};
`;

// Narrow fixed-width slot for the Daily-credits meter beside the logo, so the
// compact meter doesn't stretch to fill the header side.
export const CreditsSlot = styled.div`
  width: 150px;
  flex-shrink: 0;
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

export const StudioBody = styled.div<{ $constrain?: boolean }>`
  flex: 1;
  overflow-y: auto;
  width: 100%;
  padding: 1.5rem 20px;
  ${(props) =>
    props.$constrain &&
    `
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem;
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
