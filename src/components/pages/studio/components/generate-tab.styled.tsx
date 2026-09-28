import styled, { css } from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";
import { HistoryThumb } from "./transition-history.styled";
import { BottomRow, GenerateSection } from "./images-tab.styled";
import {
  IndeterminateTrack,
  ProgressContent,
  ProgressEta,
  ProgressMeter,
  ProgressOverlay,
} from "@/components/shared/dream-progress/dream-progress.styled";
import type { StudioJob } from "@/types/studio.types";

// Preview, settings and matrix side by side at 25% / 25% / 50%. The matrix
// track is `minmax(0, …)` so the grid inside can overflow and scroll rather
// than forcing its column wider. Narrower, preview and settings share the left
// column; narrower still, everything stacks.
export const TabLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr);
  gap: 1.25rem;
  align-items: start;

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

    > :nth-child(n) {
      grid-column: auto;
      grid-row: auto;
    }
  }
`;

export const TabColumn = styled.div`
  min-width: 0;
`;

export const CombinationGrid = styled.div`
  overflow: auto;
  max-height: min(70vh, 720px);
  border: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

// `max-content` keeps every column at its natural width so the container
// scrolls sideways instead of squeezing columns. Deliberately no
// `min-width: 100%`: stretching a narrow matrix to fill the panel hands all
// the slack to the most flexible column, which left the image names sitting in
// a cell hundreds of pixels wider than their contents. Sticky cells need
// `separate` — with `collapse` the shared borders scroll away from the cells
// they belong to.
export const GridTable = styled.table`
  width: max-content;
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
  padding: 0.5rem 0.375rem;
  text-align: center;
  font-weight: 500;
  vertical-align: bottom;
  color: ${(p) => (p.$lit ? FLOW.accent : p.theme.textBodyColor)};
  border-bottom: 2px solid ${(p) => (p.$lit ? FLOW.accent : FLOW.connector)};
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
  gap: 2px;
  width: 8rem;
  margin: 0 auto;
  padding: 2px 4px;
  background: none;
  border: none;
  border-radius: 4px;
  color: inherit;
  font: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 1px solid ${FLOW.accent};
  }
`;

export const GridHeaderIndex = styled.span`
  font-size: 11px;
  opacity: 0.6;
`;

// Always two lines tall, so headings of different lengths line up.
export const GridHeaderLabel = styled.span<{ $lit?: boolean }>`
  ${matrixLabel}
  ${(p) => p.$lit && `color: ${FLOW.accent};`}
  font-size: 14px;
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
  left: 0;
  z-index: 3;
  border-right: 2px solid ${FLOW.connector};

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

  & > :first-child {
    align-self: flex-end;
  }

  & > :last-child {
    align-self: flex-start;
  }
`;

export const GridRowHeader = styled.td<{ $lit?: boolean }>`
  padding: 0.5rem 0.375rem;
  font-weight: 500;
  color: ${(props) => props.theme.textBodyColor};
  border-right: 2px solid ${(p) => (p.$lit ? FLOW.accent : FLOW.connector)};
  border-bottom: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
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
  gap: 0.5rem;
  padding: 0;
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 1px solid ${FLOW.accent};
  }
`;

export const RowThumb = styled.img`
  width: 60px;
  height: 34px;
  flex: none;
  object-fit: cover;
  border-radius: 4px;
`;

// Capped and clipped rather than left to size the column: names run long, and
// the matrix is the thing worth the width. Hovering the row gives the whole
// name back.
export const RowName = styled.span<{ $lit?: boolean }>`
  ${matrixLabel}
  ${(p) => p.$lit && `color: ${FLOW.accent};`}
  ${RowHeaderInner}:hover & {
    color: ${FLOW.accent};
  }
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const GridCell = styled.td<{
  $excluded?: boolean;
  $band?: boolean;
  /** A row whose frame is not ready yet: nothing to pick. */
  $inert?: boolean;
}>`
  padding: 0.875rem 1.125rem;
  text-align: center;
  border-bottom: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  background: ${(p) => (p.$band ? BAND : "transparent")};
  opacity: ${(p) => (p.$inert ? 0.2 : p.$excluded ? 0.4 : 1)};
  cursor: ${(p) => (p.$inert ? "default" : "pointer")};

  &:hover {
    background: ${(p) =>
      p.$inert
        ? p.$band
          ? BAND
          : "transparent"
        : p.theme.colorBackgroundQuaternary};
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

// Stands in for the clip this combination will produce. Gold once the clip
// exists, muted while it is still only a possibility.
export const CellFilmstrip = styled.div<{ $rendered?: boolean }>`
  position: relative;
  display: inline-flex;
  justify-content: center;
  color: ${(p) => (p.$rendered ? FLOW.accent : FLOW.textDim)};
  opacity: ${(p) => (p.$rendered ? 1 : 0.55)};

  /* Above the discard button, which sits behind the glyph. */
  > svg {
    position: relative;
    z-index: 1;
  }
`;

// Marks the one clip currently in the preview. Sits on the filmstrip rather
// than beside it so the eye tracks the glyph as it moves between cells.
//
// Dark fill with a gold ring, not gold fill: the filmstrip underneath is
// already accent gold once it has rendered, and a gold badge on it simply
// disappeared.
export const PlayingEye = styled.span`
  position: absolute;
  z-index: 2;
  top: -7px;
  right: -9px;
  display: flex;
  padding: 2px;
  border-radius: 50%;
  border: 1px solid ${FLOW.accent};
  color: ${FLOW.accent};
  background: ${FLOW.bg};
  box-shadow: 0 0 0 2px ${FLOW.bgCard};
`;

// Discards the clip. Top-left, opposite the eye, tucked behind the filmstrip
// so only its corner shows.
export const CellDiscard = styled.button`
  position: absolute;
  z-index: 0;
  top: -13px;
  left: -17px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  padding: 0;
  border: none;
  border-radius: 50%;
  color: #ddd;
  background: #555;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    color: #fff;
    background: #e55;
  }
`;

// Block-level, or it shares a line with the inline-flex filmstrip above it
// instead of sitting under it.
export const CellCheckbox = styled.input.attrs({ type: "checkbox" })`
  display: block;
  margin: 0.25rem auto 0;
`;

// Sits over the middle of the filmstrip glyph, on a dark chip so it reads on
// both the muted and the gold strip.
export const CellStatus = styled.span<{ $status: StudioJob["status"] }>`
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1px 4px;
  border-radius: 3px;
  background: ${FLOW.bg};
  font-size: 0.625rem;
  line-height: 1.2;
  white-space: nowrap;
  pointer-events: none;
  color: ${(p) => (p.$status === "failed" ? "#e66" : FLOW.text)};
`;

export const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr));
  gap: 1rem;
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
  font-size: 0.8125rem;
  color: #888;
  text-align: center;
`;

export const SeedInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  border-radius: 6px;
  background: ${(props) =>
    props.theme.colorBackgroundSecondary || "transparent"};
  color: ${(props) => props.theme.textPrimaryColor};
  font-size: 0.8125rem;
  width: 6rem;
`;

export const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 480px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 0.625rem;
  }
`;

// Batch progress, carried over from the Results tab this one absorbed.
export const ProgressBar = styled.div`
  border: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  border-radius: 8px;
  padding: 0.75rem 1rem;
  /* Clear of the preview's divider above; the Generate row's own padding
     is enough below. */
  margin-top: 1rem;
`;

export const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.8125rem;
`;

export const ProgressTrack = styled.div`
  height: 8px;
  background: ${(props) => props.theme.colorBackgroundQuaternary};
  border-radius: 4px;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${(props) => props.$percent}%;
  background: ${(props) => props.theme.colorPrimary};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

export const TimeEstimate = styled.span`
  margin-right: 1rem;
  color: #888;
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
  gap: 0.75rem;
  aspect-ratio: 16 / 9;
  width: 100%;
  margin-bottom: 1.25rem;
  border: 1px dashed ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  background: ${FLOW.bg};
  color: ${FLOW.textMuted};
  font-size: 0.8125rem;
  text-align: center;
  padding: 1rem;
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
  font-size: 12px;
  padding: 4px 10px;
`;

// The Generate row, without the rule the other tabs' bottom rows carry: here
// it sits mid-column, under the progress meter, not at the foot of the tab.
export const GenerateRow = styled(BottomRow)`
  border-top: none;
`;
