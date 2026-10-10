import styled from "styled-components";
import { FLOW, flowFadeSlideUp } from "@/constants/flow-theme.constants";

export const ClipStrip = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px ${FLOW.inset};
  overflow-x: auto;
  align-items: stretch;
`;

export const ClipCard = styled.button<{ $selected: boolean }>`
  flex: 0 0 200px;
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

export const ClipThumb = styled.div<{ $ratio: string; $src?: string }>`
  aspect-ratio: ${(p) => p.$ratio};
  max-height: 120px;
  border-radius: ${FLOW.radiusSm};
  background: ${FLOW.bgInput}
    ${(p) => (p.$src ? `url("${p.$src}") center / cover no-repeat` : "")};
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

export const AddClipCard = styled.button`
  flex: 0 0 120px;
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

export const SectionTitle = styled.h3`
  margin: 20px 0 10px;
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
  font-weight: 600;
  color: ${FLOW.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

export const PromptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PromptRow = styled.div`
  display: grid;
  grid-template-columns: 88px 1fr auto;
  gap: 8px;
  align-items: start;
`;

export const FrameInput = styled.input<{ $invalid?: boolean }>`
  background: ${FLOW.bgInput};
  border: 1px solid ${(p) => (p.$invalid ? FLOW.error : FLOW.border)};
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamilyMono};
  font-size: 13px;
  padding: 8px 10px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${FLOW.accent};
  }
`;

export const PromptText = styled.textarea`
  background: ${FLOW.bgInput};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  padding: 8px 10px;
  min-height: 38px;
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

export const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
`;

export const FrameHint = styled.span`
  font-size: 11px;
  color: ${FLOW.textMuted};
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
`;

export const LivePreviewBox = styled.div`
  padding: 20px ${FLOW.inset};
  border-top: 1px solid ${FLOW.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const LiveFrame = styled.img`
  display: block;
  width: 100%;
  max-width: 720px;
  border-radius: ${FLOW.radiusSm};
  background: ${FLOW.bgInput};
  object-fit: contain;
`;

export const LivePlaceholder = styled.div`
  width: 100%;
  max-width: 720px;
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
