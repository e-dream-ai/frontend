import styled, { css, keyframes } from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";
import { HistoryThumb } from "./transition-history.styled";
import {
  BottomRow,
  GenerateSection,
  SectionHeaderRow,
  SectionTitle,
} from "./images-tab.styled";
import { PreviewContainer, PreviewLabel } from "./segment-preview.styled";
import { Field as GuidanceFieldRoot } from "./guidance-field.styled";
import {
  IndeterminateTrack,
  ProgressContent,
  ProgressEta,
  ProgressMeter,
  ProgressOverlay,
} from "@/components/shared/dream-progress/dream-progress.styled";

// Preview, settings and matrix side by side at 25% / 25% / 50%. The matrix
// track is `minmax(0, …)` so the grid inside can overflow and scroll rather
// than forcing its column wider. Narrower, preview and settings share the left
// column; narrower still, everything stacks.
export const TabLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr);
  gap: 28px 36px;
  align-items: start;
  padding: 24px ${FLOW.inset} 28px;

  ${GenerateSection} {
    padding: 0;
  }

  ${PreviewContainer} {
    padding: 0;
    border: none;
    gap: 12px;
  }

  ${SectionTitle}, ${PreviewLabel} {
    display: flex;
    align-items: center;
    min-height: 28px;
    margin-bottom: 12px;
  }

  ${SectionHeaderRow} {
    margin-bottom: 12px;
  }

  ${SectionHeaderRow} ${SectionTitle} {
    margin-bottom: 0;
  }

  /* Too narrow for 25% columns: preview and settings stack on the left, as
     they did before settings had a column of their own, with the matrix
     spanning both rows on the right. The second row takes any spare height
     so a tall matrix never opens a gap between the two. */
  @media (max-width: 1280px) {
    grid-template-columns: minmax(300px, 400px) minmax(0, 1fr);
    grid-template-rows: auto 1fr;

    > :nth-child(1) {
      grid-column: 1;
      grid-row: 1;
    }
    > :nth-child(2) {
      grid-column: 1;
      grid-row: 2;
    }
    > :nth-child(3) {
      grid-column: 2;
      grid-row: 1 / span 2;
    }
  }

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
    padding: 20px ${FLOW.insetNarrow} 24px;

    > :nth-child(n) {
      grid-column: auto;
      grid-row: auto;
    }
  }
`;

export const TabColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`;

export const CombinationGrid = styled.div`
  overflow: auto;
  max-height: min(70vh, 720px);
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radius};
  background: ${FLOW.bgCard};
`;

export const GridTable = styled.table`
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.8125rem;
`;

// Every other action column is faintly lit, so each action reads as a strip
// running down from its heading. Layered over the card colour because the
// sticky heading cells have to stay opaque.
const BAND = "rgba(255, 255, 255, 0.035)";
const banded = (band?: boolean) =>
  band ? `linear-gradient(${BAND}, ${BAND}), ${FLOW.bgCard}` : FLOW.bgCard;

// An action column is headed by its number and a few words — the prompt
// itself is a sentence and there may be dozens of them, so spelling each one
// out across the header turned the matrix into something you could only read
// sideways. Clicking the heading shows the whole prompt.
export const GridHeader = styled.th<{ $band?: boolean; $lit?: boolean }>`
  padding: 14px 6px 10px;
  text-align: center;
  font-weight: 500;
  vertical-align: bottom;
  color: ${(p) => (p.$lit ? FLOW.accent : FLOW.textDim)};
  border-bottom: 1px solid ${FLOW.borderHover};
  box-shadow: ${(p) => (p.$lit ? `inset 0 -2px 0 ${FLOW.accent}` : "none")};
  min-width: 56px;
  cursor: default;

  position: sticky;
  top: 0;
  z-index: 2;
  background: ${(p) => banded(p.$band)};

  &:hover {
    color: ${FLOW.accent};
  }
`;

/** Opens the action's dialog: its number over a few words of its prompt. */
/** Column headings and row names read as one set of labels. */
const matrixLabel = css`
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  font-weight: 600;
  color: ${FLOW.text};
`;

export const GridHeaderButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 7.5rem;
  margin: 0 auto;
  padding: 4px 6px;
  background: none;
  border: none;
  border-radius: 6px;
  color: inherit;
  font: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 1px;
  }
`;

export const GridHeaderIndex = styled.span`
  font-family: ${FLOW.fontFamilyMono};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  color: ${FLOW.textMuted};

  ${GridHeaderButton}:hover & {
    color: ${FLOW.accent};
  }
`;

// Always two lines tall, so headings of different lengths line up.
export const GridHeaderLabel = styled.span<{ $lit?: boolean }>`
  ${matrixLabel}
  ${(p) => p.$lit && `color: ${FLOW.accent};`}
  font-size: 13px;
  font-weight: 700;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
  min-height: 2.6em;
  overflow-wrap: anywhere;

  ${GridHeaderButton}:hover & {
    color: ${FLOW.accent};
  }
`;

// The empty top-left cell sits in both sticky tracks, so it outranks each.
export const GridCorner = styled(GridHeader)`
  width: 1%;
  left: 0;
  z-index: 3;
  padding: 14px 14px 10px 12px;
  border-right: 1px solid ${FLOW.borderHover};

  &:hover {
    color: inherit;
  }
`;

/** Says which way is which: actions run across the top, images down the side. */
export const CornerKey = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-family: ${FLOW.fontFamily};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${FLOW.textMuted};

  & > span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  & > :first-child {
    align-self: flex-end;
  }

  & > :last-child {
    align-self: flex-start;
  }
`;

export const GridRowHeader = styled.td<{ $lit?: boolean }>`
  padding: 8px 14px 8px 12px;
  font-weight: 500;
  color: ${FLOW.textDim};
  border-right: 1px solid ${FLOW.borderHover};
  border-bottom: 1px solid ${FLOW.border};
  box-shadow: ${(p) => (p.$lit ? `inset -2px 0 0 ${FLOW.accent}` : "none")};
  min-width: 100px;

  position: sticky;
  left: 0;
  z-index: 1;
  background: ${FLOW.bgCard};
`;

// The source frame now identifies its row here, rather than repeating in every
// cell across it.
// A button: clicking the frame or its name opens its dialog.
export const RowHeaderInner = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px;
  background: none;
  border: none;
  border-radius: 6px;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 1px;
  }
`;

export const RowThumb = styled.img`
  width: 64px;
  height: 36px;
  flex: none;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 0 0 1px ${FLOW.border};

  ${RowHeaderInner}:hover & {
    box-shadow: 0 0 0 1px ${FLOW.accent};
  }
`;

// Capped rather than left to size the column: names run long, and the matrix
// is the thing worth the width. Up to three lines, then clipped; the row's
// dialog has the whole name.
export const RowName = styled.span<{ $lit?: boolean }>`
  ${matrixLabel}
  ${(p) => p.$lit && `color: ${FLOW.accent};`}
  ${RowHeaderInner}:hover & {
    color: ${FLOW.accent};
  }
  width: max-content;
  max-width: 130px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  overflow-wrap: anywhere;
`;

export const GridCell = styled.td<{
  $band?: boolean;
  /** A row whose frame is not ready yet: nothing to pick. */
  $inert?: boolean;
}>`
  padding: 8px 10px;
  text-align: center;
  border-bottom: 1px solid ${FLOW.border};
  background: ${(p) => (p.$band ? BAND : "transparent")};
  opacity: ${(p) => (p.$inert ? 0.35 : 1)};
  cursor: pointer;
  pointer-events: ${(p) => (p.$inert ? "none" : "auto")};

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: -4px;
  }
`;

export type CellTone =
  | "skipped"
  | "planned"
  | "rendering"
  | "rendered"
  | "failed";

const TILE_BORDER: Record<CellTone, string> = {
  skipped: FLOW.border,
  planned: FLOW.connector,
  rendering: FLOW.borderHover,
  rendered: "rgba(212, 168, 83, 0.45)",
  failed: "rgba(248, 113, 113, 0.45)",
};

const TILE_BACKGROUND: Record<CellTone, string> = {
  skipped: "transparent",
  planned: FLOW.bgElevated,
  rendering: FLOW.bgElevated,
  rendered: FLOW.accentGlow,
  failed: FLOW.errorDim,
};

export const CellTile = styled.div<{
  $tone: CellTone;
  $picked?: boolean;
  $playing?: boolean;
}>`
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 96px;
  margin: 0 auto;
  padding: 14px 10px 10px;
  border-radius: ${FLOW.radiusSm};
  border: 1px ${(p) => (p.$tone === "skipped" ? "dashed" : "solid")}
    ${(p) => (p.$picked ? FLOW.accent : TILE_BORDER[p.$tone])};
  background: ${(p) => TILE_BACKGROUND[p.$tone]};
  box-shadow: ${(p) =>
    p.$playing
      ? `0 0 0 1px ${FLOW.accent}, 0 0 14px ${FLOW.accentDim}`
      : "none"};
  opacity: ${(p) => (p.$tone === "skipped" ? 0.6 : 1)};
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    opacity 0.15s ease;

  ${GridCell}:hover & {
    opacity: 1;
    border-color: ${(p) => (p.$picked ? FLOW.accent : FLOW.textMuted)};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const PendingRowHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// The Images tab's card and progress overlay, cut down to fit a matrix row.
export const PendingRowThumb = styled.div`
  position: relative;
  width: 96px;
  aspect-ratio: 16 / 9;
  flex: none;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid ${FLOW.border};
  background: ${FLOW.bgElevated};

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.5;
  }

  ${ProgressOverlay} {
    padding: 8px 5px 4px;
  }

  ${ProgressContent} {
    gap: 3px;
    font-size: 9px;
    line-height: 1.2;
  }

  ${ProgressEta} {
    display: none;
  }

  ${IndeterminateTrack} {
    height: 3px;
  }

  /* The meter sets its height inline on its track. */
  ${ProgressMeter} > div {
    height: 3px !important;
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.85; }
`;

const sweep = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(250%); }
`;

const GLYPH_COLOR: Record<CellTone, string> = {
  skipped: FLOW.textMuted,
  planned: FLOW.textMuted,
  rendering: FLOW.textMuted,
  rendered: FLOW.accent,
  failed: FLOW.error,
};

// Stands in for the clip this combination will produce. Gold once the clip
// exists, muted while it is still only a possibility.
export const CellFilmstrip = styled.div<{ $tone: CellTone; $busy?: boolean }>`
  display: flex;
  justify-content: center;
  color: ${(p) => GLYPH_COLOR[p.$tone]};
  opacity: ${(p) =>
    p.$tone === "rendered" ? 1 : p.$tone === "failed" ? 0.85 : 0.7};

  ${(p) =>
    p.$busy &&
    css`
      animation: ${pulse} 1.8s ease-in-out infinite;
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const cornerBadge = css`
  position: absolute;
  z-index: 2;
  top: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 50%;
`;

export const PlayingEye = styled.span`
  ${cornerBadge}
  right: 6px;
  border: 1px solid ${FLOW.accent};
  color: ${FLOW.accent};
  background: ${FLOW.bg};
`;

export const CellDiscard = styled.button`
  ${cornerBadge}
  left: 6px;
  border: none;
  color: ${FLOW.textDim};
  background: ${FLOW.bgInput};
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease;

  ${CellTile}:hover &,
  &:focus-visible {
    opacity: 1;
  }

  &:hover {
    color: ${FLOW.text};
    background: ${FLOW.error};
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 1px;
  }

  @media (hover: none) {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const CellFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-height: 18px;
`;

export const CellFailedLabel = styled.span`
  font-family: ${FLOW.fontFamily};
  font-size: 10px;
  font-weight: 700;
  color: ${FLOW.error};
`;

export const CellProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
`;

export const CellProgressLabel = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px;
  font-family: ${FLOW.fontFamily};
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  color: ${FLOW.textDim};

  > :only-child {
    margin-inline: auto;
  }

  > :nth-child(2) {
    font-family: ${FLOW.fontFamilyMono};
    font-variant-numeric: tabular-nums;
    color: ${FLOW.accent};
  }
`;

export const CellProgressTrack = styled.div`
  position: relative;
  height: 3px;
  overflow: hidden;
  border-radius: 2px;
  background: ${FLOW.bgInput};
`;

export const CellProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${(p) => p.$percent}%;
  border-radius: 2px;
  background: ${FLOW.accent};
  transition: width 0.3s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const CellProgressSweep = styled.div`
  position: absolute;
  inset: 0;
  width: 40%;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, ${FLOW.accent}, transparent);
  animation: ${sweep} 1.2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    width: 100%;
    opacity: 0.4;
    background: ${FLOW.accent};
    animation: none;
  }
`;

const CHECK_MARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2.5 6.2l2.3 2.3 4.7-4.9' fill='none' stroke='%230c0c0e' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

export const CellCheckbox = styled.input.attrs({ type: "checkbox" })`
  appearance: none;
  display: block;
  flex: none;
  width: 16px;
  height: 16px;
  margin: 0;
  border: 1.5px solid ${FLOW.connector};
  border-radius: 4px;
  background: ${FLOW.bg} center / 12px 12px no-repeat;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    border-color: ${FLOW.accent};
  }

  &:checked {
    border-color: ${FLOW.accent};
    background-color: ${FLOW.accent};
    background-image: ${CHECK_MARK};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 14px;

  ${GuidanceFieldRoot} {
    width: 100%;
  }

  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const SettingField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
`;

export const SettingFieldWide = styled(SettingField)`
  grid-column: 1 / -1;
`;

export const SettingLabel = styled.label`
  font-family: ${FLOW.fontFamily};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${FLOW.textMuted};
`;

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5l3 3 3-3' fill='none' stroke='%2394929a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

const settingControl = css`
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  background-color: ${FLOW.bgElevated};
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${FLOW.borderHover};
  }

  &:focus-visible {
    outline: none;
    border-color: ${FLOW.accent};
    box-shadow: 0 0 0 3px ${FLOW.accentDim};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const SettingSelect = styled.select`
  ${settingControl}
  appearance: none;
  padding-right: 32px;
  background-image: ${CHEVRON};
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px;
  cursor: pointer;
`;

export const PlaylistRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;

  > select {
    flex: 1 1 12rem;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;

    > select {
      flex: 0 0 auto;
    }
  }
`;

export const ComboCountText = styled.p`
  margin-top: 12px;
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  color: ${FLOW.textMuted};

  strong {
    font-family: ${FLOW.fontFamilyMono};
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: ${FLOW.text};
  }
`;

export const SeedInput = styled.input`
  ${settingControl}
  font-family: ${FLOW.fontFamilyMono};
  font-variant-numeric: tabular-nums;
`;

// Batch progress, carried over from the Results tab this one absorbed.
export const ProgressBar = styled.div`
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  background: ${FLOW.bg};
  padding: 12px 14px;
`;

export const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 10px;
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  color: ${FLOW.textDim};

  > :last-child {
    font-family: ${FLOW.fontFamilyMono};
    font-variant-numeric: tabular-nums;
    color: ${FLOW.text};
  }
`;

export const ProgressTrack = styled.div`
  height: 4px;
  background: ${FLOW.bgInput};
  border-radius: 2px;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${(props) => props.$percent}%;
  background: ${FLOW.accent};
  border-radius: 2px;
  transition: width 0.3s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const TimeEstimate = styled.span`
  margin-right: 10px;
  color: ${FLOW.textMuted};
`;

export const ActionButton = styled.button<{ $accent?: boolean }>`
  background: ${(p) => (p.$accent ? FLOW.accentDim : FLOW.bgElevated)};
  color: ${(p) => (p.$accent ? FLOW.accent : FLOW.textDim)};
  border: 1px solid ${(p) => (p.$accent ? FLOW.accent : FLOW.border)};
  border-radius: ${FLOW.radiusSm};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(p) => (p.$accent ? FLOW.accent : FLOW.borderHover)};
    color: ${(p) => (p.$accent ? FLOW.bg : FLOW.text)};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Stands in for the player before anything has rendered, so the left column
// keeps its shape instead of collapsing to the settings alone.
export const PreviewPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  aspect-ratio: 16 / 9;
  width: 100%;
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  background: radial-gradient(
      ellipse at 50% 45%,
      ${FLOW.accentGlow},
      transparent 70%
    ),
    ${FLOW.bg};
  color: ${FLOW.textMuted};
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
  padding: 16px;

  > svg {
    color: ${FLOW.borderHover};
  }
`;

// Under the preview: which reference frame is playing on the left, and which
// of its actions on the right. Replaces the chip rail's bare segment numbers,
// which said nothing about what a clip actually is.
export const PreviewCaption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  min-width: 0;
`;

export const CaptionFrame = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1 1 auto;
`;

export const CaptionThumb = styled.img`
  width: 44px;
  height: 26px;
  flex: none;
  object-fit: cover;
  border-radius: 3px;
`;

export const CaptionName = styled.span`
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  color: ${FLOW.textDim};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Wraps rather than scrolling: it has the column's full width, unlike the
// flow studio's rail squeezed into a header row.
export const ClipHistoryGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  > button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

// Half the flow studio's take thumbnail: many clips pile up here.
export const ClipHistoryThumb = styled(HistoryThumb)`
  width: 63px;
  height: 36px;
`;

// With nothing checked there is nothing for the settings to apply to, so they
// hide. Visibility rather than display: the column keeps its size and nothing
// around it moves, and hidden fields drop out of the tab order.
export const SettingsSection = styled(GenerateSection)<{ $hidden: boolean }>`
  visibility: ${(p) => (p.$hidden ? "hidden" : "visible")};
`;

// Compact sibling of ActionButton for the matrix header row.
export const MatrixCheckButton = styled(ActionButton)`
  height: 28px;
  padding: 0 12px;
  background: transparent;
  font-size: 12px;

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 1px;
  }
`;

// The Generate row, without the rule the other tabs' bottom rows carry: here
// it sits mid-column, under the progress meter, not at the foot of the tab.
export const GenerateRow = styled(BottomRow)`
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  padding: 0;
  border-top: none;

  @media (max-width: 480px) {
    padding: 0;
  }

  & + ${GenerateSection} {
    padding-top: 20px;
    border-top: 1px solid ${FLOW.border};
  }
`;

export const GenerateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 44px;
  padding: 0 18px;
  border: 1px solid ${FLOW.accent};
  border-radius: ${FLOW.radiusSm};
  background: ${FLOW.accent};
  color: ${FLOW.bg};
  font-family: ${FLOW.fontFamily};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    filter 0.15s ease,
    background-color 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 2px;
  }

  &:disabled {
    border-color: ${FLOW.border};
    background: ${FLOW.bgElevated};
    color: ${FLOW.textMuted};
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
