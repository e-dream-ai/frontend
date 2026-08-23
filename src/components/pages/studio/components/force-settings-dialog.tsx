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
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Shown when transitions that disagree about a setting are about to be edited
 * as one group. A group with mixed settings has no honest thing to show in the
 * panel, so the disagreement is resolved up front: OK forces one value on all
 * of them, Cancel leaves them apart.
 */
export function ForceSettingsDialog({
  onConfirm,
  onCancel,
}: ForceSettingsDialogProps) {
  const overlayRef = useLightboxA11y<HTMLDivElement>(onCancel);

  return createPortal(
    <DialogOverlay
      ref={overlayRef}
      tabIndex={-1}
      onClick={onCancel}
      // Return cancels: forcing settings is the destructive answer, so it is
      // never what a blind keypress does. Cancel holds focus from the moment
      // the dialog opens (it is the first focusable thing in it), so a keypress
      // that reaches a button is that button's to handle — this is only for the
      // ones that land on the dialog itself.
      onKeyDown={(e) => {
        if (e.key !== "Enter" || e.target instanceof HTMLButtonElement) return;
        e.preventDefault();
        onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="force-settings-title"
      aria-describedby="force-settings-body"
    >
      <DialogCard onClick={(e) => e.stopPropagation()}>
        <DialogTitle id="force-settings-title">
          Transitions have different settings
        </DialogTitle>
        <DialogBody id="force-settings-body">
          Editing them together forces one value on all of them &mdash; the
          settings shown now. Cancel leaves them as they are.
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
