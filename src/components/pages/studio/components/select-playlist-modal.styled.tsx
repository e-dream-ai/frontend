import styled from "styled-components";
import { Footer, CountLabel, FooterButtons } from "./select-modal.styled";
import { FLOW } from "@/constants/flow-theme.constants";

/** Playlist tile styles for the select-playlist modal. The modal shell (overlay,
 *  header, search row, footer) lives in ./select-modal.styled. */

export const PlaylistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  align-items: start;
`;

export const PlaylistTile = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 0;
  background: ${FLOW.bgElevated};
  border: 1px solid ${(p) => (p.$selected ? FLOW.accent : FLOW.border)};
  border-radius: ${FLOW.radiusSm};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${(p) => (p.$selected ? FLOW.accent : FLOW.borderHover)};
  }
`;

export const TileThumb = styled.div<{ $selected: boolean }>`
  width: 100%;
  position: relative;
  aspect-ratio: 16 / 9;
  background: ${FLOW.bg};
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    opacity: ${(p) => (p.$selected ? 1 : 0.85)};
    transition: opacity 0.15s;
  }

  ${PlaylistTile}:hover & img {
    opacity: 1;
  }
`;

export const TilePlaceholder = styled.span`
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${FLOW.textMuted};
  font-family: ${FLOW.fontFamily};
`;

export const TileBadge = styled.span`
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${FLOW.text};
  background: rgba(0, 0, 0, 0.65);
  border-radius: 3px;
  padding: 2px 5px;
`;

export const TileCheck = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${FLOW.accent};
  color: ${FLOW.bg};
`;

export const TileName = styled.span<{ $selected: boolean }>`
  max-width: 100%;
  padding: 7px 9px;
  font-size: 12px;
  font-family: ${FLOW.fontFamily};
  color: ${(p) => (p.$selected ? FLOW.accent : FLOW.textDim)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PlaylistFooter = styled(Footer)`
  gap: 12px;
  flex-wrap: wrap;

  ${CountLabel} {
    flex: 1 1 180px;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  ${FooterButtons} {
    margin-left: auto;
    flex-shrink: 0;
  }
`;
