import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";
import type { StudioJob } from "@/types/studio.types";

// Preview and settings on the left, the matrix on the right. The right track
// takes `minmax(0, 1fr)` so the grid inside can overflow and scroll rather than
// forcing the whole column wider.
export const TabLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(300px, 400px) minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
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

// An action column is only as wide as its number — the prompt itself is a
// sentence and there may be dozens of them, so spelling each one out across
// the header turned the matrix into something you could only read sideways.
// Hovering a column gives you the prompt.
export const GridHeader = styled.th`
  padding: 0.5rem 0.375rem;
  text-align: center;
  font-weight: 500;
  vertical-align: bottom;
  color: ${(props) => props.theme.textBodyColor};
  border-bottom: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  min-width: 56px;
  cursor: default;

  position: sticky;
  top: 0;
  z-index: 2;
  background: ${FLOW.bgCard};

  &:hover {
    color: ${FLOW.accent};
  }
`;

// The empty top-left cell sits in both sticky tracks, so it outranks each.
export const GridCorner = styled(GridHeader)`
  left: 0;
  z-index: 3;

  &:hover {
    color: inherit;
  }
`;

export const GridRowHeader = styled.td`
  padding: 0.5rem 0.375rem;
  font-weight: 500;
  color: ${(props) => props.theme.textBodyColor};
  border-right: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  border-bottom: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  min-width: 100px;

  position: sticky;
  left: 0;
  z-index: 1;
  background: ${FLOW.bgCard};
`;

// The source frame now identifies its row here, rather than repeating in every
// cell across it.
export const RowHeaderInner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
export const RowName = styled.span`
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const GridCell = styled.td<{ $excluded?: boolean }>`
  padding: 0.5rem 0.375rem;
  text-align: center;
  border-bottom: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  opacity: ${(props) => (props.$excluded ? 0.4 : 1)};
  cursor: pointer;

  &:hover {
    background: ${(props) => props.theme.colorBackgroundQuaternary};
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
`;

// Marks the one clip currently in the preview. Sits on the filmstrip rather
// than beside it so the eye tracks the glyph as it moves between cells.
//
// Dark fill with a gold ring, not gold fill: the filmstrip underneath is
// already accent gold once it has rendered, and a gold badge on it simply
// disappeared.
export const PlayingEye = styled.span`
  position: absolute;
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

// Block-level, or it shares a line with the inline-flex filmstrip above it
// instead of sitting under it.
export const CellCheckbox = styled.input.attrs({ type: "checkbox" })`
  display: block;
  margin: 0.25rem auto 0;
`;

export const CellStatus = styled.span<{ $status: StudioJob["status"] }>`
  display: block;
  margin-top: 0.25rem;
  font-size: 0.625rem;
  line-height: 1.2;
  color: ${(p) =>
    p.$status === "processed"
      ? "#6c6"
      : p.$status === "failed"
        ? "#c66"
        : FLOW.textDim};
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

export const DescriptionText = styled.p`
  font-size: 0.8125rem;
  color: #888;
  margin-bottom: 1rem;
`;

export const ComboCountText = styled.p`
  font-size: 0.8125rem;
  color: #888;
  text-align: center;
`;

export const HintText = styled.p`
  font-size: 0.8125rem;
  color: #c9a84c;
  margin-bottom: 0.75rem;
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
  margin-bottom: 1.25rem;
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

export const JobActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 1rem;
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
