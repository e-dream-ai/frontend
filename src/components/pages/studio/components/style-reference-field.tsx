import { useMemo, useState } from "react";
import type { StyleReference } from "@/types/studio.types";
import { SelectImageDreamModal } from "./select-image-dream-modal";
import { CancelBtn } from "./select-modal.styled";
import { FieldLabel, FieldHint } from "./transition-settings-panel.styled";
import {
  ReferenceField,
  ReferencePreview,
  ReferenceThumbnail,
  ReferenceImage,
  ReferenceName,
  ReferenceActions,
} from "./style-reference-field.styled";

interface Props {
  value: StyleReference | null;
  onChange: (reference: StyleReference | null) => void;
}

export const StyleReferenceField = ({ value, onChange }: Props) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const existingDreamUuids = useMemo(
    () => new Set(value ? [value.uuid] : []),
    [value],
  );

  return (
    <ReferenceField role="group" aria-labelledby="style-reference-label">
      <FieldLabel as="div" id="style-reference-label">
        Style reference (required)
      </FieldLabel>
      <FieldHint id="style-reference-hint">
        Choose one image to guide the colors, textures, and visual style of
        every image in this batch.
      </FieldHint>
      {value ? (
        <ReferencePreview>
          <ReferenceThumbnail>
            <ReferenceImage dreamUuid={value.uuid} alt={value.name} />
          </ReferenceThumbnail>
          <ReferenceName>{value.name}</ReferenceName>
          <ReferenceActions>
            <CancelBtn
              type="button"
              onClick={() => setPickerOpen(true)}
              aria-label="Change reference"
            >
              Change
            </CancelBtn>
            <CancelBtn
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove reference"
            >
              Remove
            </CancelBtn>
          </ReferenceActions>
        </ReferencePreview>
      ) : (
        <CancelBtn
          type="button"
          onClick={() => setPickerOpen(true)}
          aria-describedby="style-reference-hint"
        >
          Choose reference image
        </CancelBtn>
      )}
      {pickerOpen ? (
        <SelectImageDreamModal
          onClose={() => setPickerOpen(false)}
          existingDreamUuids={existingDreamUuids}
          selectionLimit={1}
          onAdd={([dream]) => {
            if (dream) onChange({ uuid: dream.uuid, name: dream.name });
          }}
        />
      ) : null}
    </ReferenceField>
  );
};
