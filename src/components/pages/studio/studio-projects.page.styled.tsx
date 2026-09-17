import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import { FLOW, flowFadeSlideUp } from "@/constants/flow-theme.constants";
import type { StudioMode } from "@/types/flow.types";

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${FLOW.bg};
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
`;

export const Header = styled.header`
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

export const Title = styled.h1`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  margin: 0;
`;

export const HeaderSpacer = styled.div`
  flex: 1;
`;

export const FilterToggle = styled.div`
  display: flex;
  background: ${FLOW.bg};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  padding: 3px;
  gap: 2px;
`;

export const FilterButton = styled.button<{ $active: boolean }>`
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-family: ${FLOW.fontFamily};
  color: ${(p) => (p.$active ? FLOW.text : FLOW.textMuted)};
  background: ${(p) => (p.$active ? FLOW.bgElevated : "transparent")};
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${FLOW.text};
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 1px;
  }

  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

export const NewButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: ${FLOW.radiusSm};
  background: ${FLOW.accentDim};
  border: 1px solid ${FLOW.accent};
  color: ${FLOW.accent};
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: ${FLOW.accent};
    color: ${FLOW.bg};
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 2px;
  }
`;

export const Body = styled.main`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${FLOW.insetNarrow} ${FLOW.inset} 48px;

  @media (max-width: 480px) {
    padding: 14px 14px 32px;
  }
`;

export const SectionLabel = styled.h2`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${FLOW.textMuted};
  margin: 0 0 12px;
`;

export const Grid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
`;

export const Card = styled.li`
  position: relative;
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radius};
  overflow: hidden;
  transition:
    border-color 0.15s,
    transform 0.15s;
  animation: ${flowFadeSlideUp} 0.2s ease both;

  &:hover {
    border-color: ${FLOW.borderHover};
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: border-color 0.15s;

    &:hover {
      transform: none;
    }
  }
`;

export const CardLink = styled(Link)`
  display: flex;
  flex-direction: column;
  color: inherit;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: -2px;
  }
`;

export const Thumb = styled.div`
  position: relative;
  flex: none;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: ${FLOW.bgInput};
  overflow: hidden;
  color: ${FLOW.textMuted};

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const ThumbFallback = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EDITOR_BADGE: Record<StudioMode, string> = {
  flow: FLOW.accent,
  action: FLOW.processing,
  uprez: FLOW.success,
};

export const ThumbBadge = styled.span<{ $mode: StudioMode }>`
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 3px 7px;
  border-radius: 4px;
  background: ${(p) => EDITOR_BADGE[p.$mode] ?? FLOW.textDim};
  color: ${FLOW.bg};
`;

export const CardBody = styled.div`
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

export const CardName = styled.span`
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: ${FLOW.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CardMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CardMeta = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: ${FLOW.textMuted};
`;

export const DeleteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: rgba(12, 12, 14, 0.72);
  color: ${FLOW.textDim};
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.15s,
    color 0.15s,
    border-color 0.15s;

  ${Card}:hover &,
  &:focus-visible {
    opacity: 1;
  }

  &:hover:not(:disabled) {
    color: ${FLOW.error};
    border-color: ${FLOW.errorDim};
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 1px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }

  @media (hover: none) {
    opacity: 1;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 48px 0;
  max-width: 420px;
`;

export const EmptyTitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${FLOW.textDim};
`;

export const EmptyHint = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${FLOW.textMuted};
  line-height: 1.5;
`;

export const SkeletonGrid = styled(Grid)`
  pointer-events: none;
`;

const skeletonPulse = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.75; }
`;

export const SkeletonCard = styled.li`
  height: 160px;
  border-radius: ${FLOW.radius};
  border: 1px solid ${FLOW.border};
  background: ${FLOW.bgCard};
  animation: ${skeletonPulse} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.55;
  }
`;
