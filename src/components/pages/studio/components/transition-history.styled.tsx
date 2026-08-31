import styled, { css } from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

/**
 * Inline strip that lives in the Transition Settings header row, right of the
 * title. It used to be its own section, but that section appearing and
 * disappearing as takes complete shoved the preview up and down the page.
 * Here the enclosing row reserves the height once (HISTORY_ROW_HEIGHT), so the
 * panel is the same height whether or not there is anything to show.
 */
export const HISTORY_ROW_HEIGHT = 88;

export const HistoryInline = styled.div`
  display: flex;
  flex-direction: column;
  /* Heading sits above the thumbs, both hard against the right edge of the
     settings row. */
  align-items: flex-end;
  gap: 6px;
  min-width: 0;
`;

export const HistoryTitle = styled.span`
  flex-shrink: 0;
  font-family: ${FLOW.fontFamily};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${FLOW.textMuted};
`;

export const HistoryRail = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  overflow-x: auto;
  min-width: 0;

  /* The rail scrolls on its own so a long take list never widens the header. */
  scrollbar-width: thin;
  scrollbar-color: ${FLOW.borderHover} transparent;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${FLOW.borderHover};
    border-radius: 2px;
  }
`;

export const HistoryItem = styled.button<{ $current: boolean }>`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 2px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: ${FLOW.fontFamily};
  transition: background-color 0.18s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.selected};
    outline-offset: 1px;
  }

  ${(p) =>
    p.$current &&
    css`
      cursor: default;
    `}
`;

export const HistoryThumb = styled.div<{ $current: boolean }>`
  width: 84px;
  height: 48px;
  border-radius: 5px;
  overflow: hidden;
  background: ${FLOW.bgElevated};
  display: flex;
  align-items: center;
  justify-content: center;

  /* The rectangle that marks which take is live in the flow. */
  box-shadow: ${(p) =>
    p.$current
      ? `0 0 0 2px ${FLOW.accent}, 0 0 10px ${FLOW.accentGlow}`
      : `inset 0 0 0 1px ${FLOW.border}`};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const HistoryPlaceholder = styled.span`
  font-size: 10px;
  color: ${FLOW.textMuted};
`;

export const HistoryTime = styled.span<{ $current: boolean }>`
  font-size: 10px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  color: ${(p) => (p.$current ? FLOW.accent : FLOW.textMuted)};
  font-weight: ${(p) => (p.$current ? 700 : 500)};
`;

export const HistoryEmpty = styled.span`
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
  color: ${FLOW.textMuted};
  white-space: nowrap;
`;
