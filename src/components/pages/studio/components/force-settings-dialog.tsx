import { createPortal } from "react-dom";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import {
  DialogOverlay,
  DialogCard,
  DialogTitle,
  DialogBody,
  DialogActions,
  CancelButton,
  ConfirmButton,
} from "./force-settings-dialog.styled";

interface ForceSettingsDialogProps {
  /** Human-readable name of the field being edited, e.g. "Prompt". */
  fieldLabel: string;
  /** How many transitions the edit would be forced onto. */
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Shown when an edit would overwrite a setting the selected transitions
 * currently disagree about. Editing them as a group means picking one value,
 * so the choice is made explicit rather than silently flattening the others.
 */
export function ForceSettingsDialog({
  fieldLabel,
  count,
  onConfirm,
  onCancel,
}: ForceSettingsDialogProps) {
  const overlayRef = useLightboxA11y<HTMLDivElement>(onCancel);

  return createPortal(
    <DialogOverlay
      ref={overlayRef}
      tabIndex={-1}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="force-settings-title"
      aria-describedby="force-settings-body"
    >
      <DialogCard onClick={(e) => e.stopPropagation()}>
        <DialogTitle id="force-settings-title">
          Can&rsquo;t edit mismatched settings
        </DialogTitle>
        <DialogBody id="force-settings-body">
          The {count} selected transitions don&rsquo;t share the same{" "}
          <strong>{fieldLabel}</strong>. Force them all to the same value?
        </DialogBody>
        <DialogActions>
          <CancelButton type="button" onClick={onCancel}>
            Cancel
          </CancelButton>
          <ConfirmButton type="button" onClick={onConfirm}>
            OK
          </ConfirmButton>
        </DialogActions>
      </DialogCard>
    </DialogOverlay>,
    document.body,
  );
}
