import styled from "styled-components";
import { FLOW, flowFadeSlideUp } from "@/constants/flow-theme.constants";
import {
  PanelContainer,
  PanelSubtitle,
} from "./transition-settings-panel.styled";
import { PreviewLabel } from "./segment-preview.styled";

/**
 * The preview in a column on the left, a third of the width, with the
 * animations beside it. Stacked, preview first, once there is no room.
 */
export const DeforumTop = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const PreviewColumn = styled.div`
  border-right: 1px solid ${FLOW.border};
  align-self: stretch;

  /* The column's own edge separates it; the first block needs no rule. */
  & > :first-child {
    border-top: none;
  }

  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid ${FLOW.border};
  }
`;

export const PreviewEmpty = styled.div`
  padding: 48px ${FLOW.inset};
  text-align: center;
  color: ${FLOW.textMuted};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
`;

/** Titles the dream list as "Preview" titles the column beside it. */
export const ClipListLabel = styled(PreviewLabel)`
  display: block;
  padding: 24px ${FLOW.inset} 0;

  @media (max-width: 480px) {
    padding: 20px ${FLOW.insetNarrow} 0;
  }
`;

/**
 * Holds the scrolling strip, fading whichever edge has more dreams past it
 * and putting an arrow there, since scrollbars stay hidden on macOS.
 */
export const ClipStripViewport = styled.div<{
  $left: boolean;
  $right: boolean;
}>`
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 56px;
    pointer-events: none;
    transition: opacity 0.18s ease;
    z-index: 1;
  }

  &::before {
    left: 0;
    background: linear-gradient(to right, ${FLOW.bgCard}, transparent);
    opacity: ${(p) => (p.$left ? 1 : 0)};
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, ${FLOW.bgCard}, transparent);
    opacity: ${(p) => (p.$right ? 1 : 0)};
  }
`;

export const StripArrow = styled.button<{ $side: "left" | "right" }>`
  position: absolute;
  top: 50%;
  ${(p) => (p.$side === "left" ? "left: 8px" : "right: 8px")};
  transform: translateY(-50%);
  z-index: 2;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: ${FLOW.bgElevated};
  border: 1px solid ${FLOW.borderHover};
  border-radius: 50%;
  color: ${FLOW.text};
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);

  &:hover {
    border-color: ${FLOW.accent};
    color: ${FLOW.accent};
  }
`;

export const ClipStrip = styled.div`
  display: flex;
  gap: 12px;
  padding: 14px ${FLOW.inset} 20px;
  overflow-x: auto;
  align-items: stretch;

  @media (max-width: 480px) {
    padding: 14px ${FLOW.insetNarrow} 16px;
  }
`;

/** Positions the delete button over the card without nesting it inside. */
export const ClipCardFrame = styled.div`
  position: relative;
  flex: 0 0 180px;
  display: flex;
`;

export const ClipDeleteButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: ${FLOW.bgElevated};
  border: 1px solid ${FLOW.border};
  border-radius: 50%;
  color: ${FLOW.textDim};
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.6;
  transition:
    opacity 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease;

  ${ClipCardFrame}:hover &,
  &:focus-visible {
    opacity: 1;
  }

  &:hover {
    color: ${FLOW.error};
    border-color: ${FLOW.error};
  }
`;

export const ClipCard = styled.button<{ $selected: boolean }>`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  text-align: left;
  background: ${(p) => (p.$selected ? FLOW.selectedDim : FLOW.bgElevated)};
  border: 1px solid ${(p) => (p.$selected ? FLOW.selected : FLOW.border)};
  border-radius: ${FLOW.radius};
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  cursor: pointer;
  animation: ${flowFadeSlideUp} 0.3s ease;
  transition: border-color 0.18s ease;

  &:hover {
    border-color: ${(p) => (p.$selected ? FLOW.selected : FLOW.borderHover)};
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.selectedGlow};
    outline-offset: 2px;
  }
`;

export const ClipThumb = styled.div<{ $ratio: string }>`
  aspect-ratio: ${(p) => p.$ratio};
  max-height: 120px;
  border-radius: ${FLOW.radiusSm};
  background: ${FLOW.bgInput} center / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${FLOW.textMuted};
  font-size: 11px;
  padding: 8px;
  overflow: hidden;
`;

export const ClipName = styled.span`
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ClipMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11px;
  color: ${FLOW.textMuted};
`;

const PILL_COLORS = {
  none: [FLOW.bgInput, FLOW.textMuted],
  queue: [FLOW.bgInput, FLOW.textDim],
  processing: [FLOW.processingDim, FLOW.processing],
  processed: [FLOW.successDim, FLOW.success],
  stale: [FLOW.accentDim, FLOW.accent],
  failed: [FLOW.errorDim, FLOW.error],
} as const;

export type PillTone = keyof typeof PILL_COLORS;

export const StatusPill = styled.span<{ $tone: PillTone }>`
  padding: 2px 8px;
  border-radius: 999px;
  background: ${(p) => PILL_COLORS[p.$tone][0]};
  color: ${(p) => PILL_COLORS[p.$tone][1]};
  white-space: nowrap;
`;

export const AddClipFrame = styled.div`
  flex: 0 0 120px;
  display: flex;
`;

export const AddClipCard = styled.button`
  flex: 1;
  min-height: 120px;
  border: 1px dashed ${FLOW.borderHover};
  border-radius: ${FLOW.radius};
  background: transparent;
  color: ${FLOW.textDim};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  cursor: pointer;

  &:hover {
    border-color: ${FLOW.accent};
    color: ${FLOW.accent};
  }
`;

export const StripActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 ${FLOW.inset} 16px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    padding: 0 ${FLOW.insetNarrow} 16px;
  }
`;

export const SmallButton = styled.button`
  background: ${FLOW.bgInput};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.textDim};
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  padding: 5px 10px;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: ${FLOW.borderHover};
    color: ${FLOW.text};
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

/** One block of the settings form, set off from the one above by a rule. */
export const DeforumPanel = styled(PanelContainer)`
  @media (max-width: 480px) {
    padding: 20px ${FLOW.insetNarrow};

    input,
    textarea,
    select {
      font-size: 16px;
    }
  }
`;

export const PanelTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 12px;
  }
`;

export const RenderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    display: grid;
    grid-template-columns: 1fr 1fr;

    & > button {
      min-height: 40px;
    }

    & > a {
      grid-column: 1 / -1;
    }
  }
`;

export const FramesField = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 480px) {
    grid-column: 1 / -1;
  }
`;

export const EditingLabel = styled(PanelSubtitle)`
  @media (max-width: 480px) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const Section = styled.section`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid ${FLOW.border};
`;

/** A section's title row; a section-wide control sits just after the title. */
export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
`;

/**
 * Brighter and larger than field labels, so the sections read as the top
 * level of the form and the labels as what sits inside them.
 */
export const SectionTitle = styled.h3`
  margin: 0;
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  font-weight: 600;
  color: ${FLOW.text};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

/** Two-way switch for a section-wide setting, e.g. 3D | 2D. */
export const SegmentedControl = styled.div`
  display: inline-flex;
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  overflow: hidden;
`;

export const SegmentButton = styled.button<{ $active: boolean }>`
  background: ${(p) => (p.$active ? FLOW.accentDim : "transparent")};
  border: 0;
  color: ${(p) => (p.$active ? FLOW.accent : FLOW.textMuted)};
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  cursor: pointer;

  & + & {
    border-left: 1px solid ${FLOW.border};
  }

  &:hover {
    color: ${(p) => (p.$active ? FLOW.accent : FLOW.text)};
  }
`;

export const PromptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 480px) {
    gap: 16px;
  }
`;

const PROMPT_ROW_HEIGHT = "44px";

export const PromptRow = styled.div`
  display: grid;
  grid-template-columns: auto 88px 1fr;
  grid-template-areas: "remove frame text";
  gap: 8px;
  align-items: start;

  @media (max-width: 480px) {
    grid-template-columns: 88px 1fr auto;
    grid-template-areas:
      "frame . remove"
      "text text text";
    gap: 6px 8px;
  }
`;

export const PromptRemove = styled(SmallButton)`
  grid-area: remove;
  width: ${PROMPT_ROW_HEIGHT};
  height: ${PROMPT_ROW_HEIGHT};
  padding: 0;
`;

export const PromptFrame = styled.div`
  grid-area: frame;
`;

export const FrameInput = styled.input<{ $invalid?: boolean }>`
  background: ${FLOW.bgInput};
  border: 1px solid ${(p) => (p.$invalid ? FLOW.error : FLOW.border)};
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamilyMono};
  font-size: 13px;
  height: ${PROMPT_ROW_HEIGHT};
  padding: 0 10px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${FLOW.accent};
  }

  &:read-only {
    color: ${FLOW.textMuted};
    cursor: default;
  }
`;

export const PromptText = styled.textarea`
  grid-area: text;
  background: ${FLOW.bgInput};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  font-size: 15px;
  line-height: 22px;
  padding: 10px 12px;
  min-height: ${PROMPT_ROW_HEIGHT};
  resize: vertical;
  field-sizing: content;

  &:focus {
    outline: none;
    border-color: ${FLOW.accent};
  }
`;

export const TextInput = styled.input`
  background: ${FLOW.bgInput};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  padding: 6px 10px;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: ${FLOW.accent};
  }
`;

export const ScheduleInput = styled(TextInput)`
  font-family: ${FLOW.fontFamilyMono};
  font-size: 12px;
`;

export const ParamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
`;

export const MotionRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const SecondaryButton = styled.button<{ $disabled?: boolean }>`
  background: transparent;
  border: 1px solid ${FLOW.accent};
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.accent};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  font-weight: 600;
  padding: 7px 18px;
  cursor: ${(p) => (p.$disabled ? "default" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.4 : 1)};

  &:hover:not(:disabled) {
    background: ${FLOW.accentDim};
  }
`;

export const EmptyState = styled.div`
  padding: 48px ${FLOW.inset};
  text-align: center;
  color: ${FLOW.textDim};
  font-family: ${FLOW.fontFamily};
  font-size: 14px;

  @media (max-width: 480px) {
    padding: 32px ${FLOW.insetNarrow};
  }
`;

export const LivePreviewBox = styled.div`
  padding: 24px ${FLOW.inset};
  border-top: 1px solid ${FLOW.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;

  @media (max-width: 480px) {
    padding: 16px ${FLOW.insetNarrow};
  }
`;

export const LiveFrame = styled.img<{ $ratio: string }>`
  display: block;
  width: 100%;
  max-width: 720px;
  aspect-ratio: ${(p) => p.$ratio};
  border-radius: ${FLOW.radiusSm};
  background: ${FLOW.bgInput};
  object-fit: contain;
`;

export const LivePlaceholder = styled.div<{ $ratio: string }>`
  width: 100%;
  max-width: 720px;
  aspect-ratio: ${(p) => p.$ratio};
  border-radius: ${FLOW.radiusSm};
  background: ${FLOW.bgInput};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${FLOW.textMuted};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
`;

export const LiveCaption = styled.div`
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  color: ${FLOW.textDim};
  text-align: center;
`;

export const HistorySection = styled.div`
  padding: 24px ${FLOW.inset};
  border-top: 1px solid ${FLOW.border};

  @media (max-width: 480px) {
    padding: 20px ${FLOW.insetNarrow};
  }
`;
