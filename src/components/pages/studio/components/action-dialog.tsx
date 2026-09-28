import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { StudioAction } from "@/types/studio.types";
import { useStudioStore } from "@/stores/studio.store";
import {
  getLoraOptionsForModel,
  NO_LORA_OPTION,
} from "../constants/lora-options";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import {
  Overlay,
  Header,
  Title,
  CloseBtn,
  Footer,
  FooterButtons,
  CancelBtn,
  AddBtn,
} from "./select-modal.styled";
import {
  FieldLabel,
  PromptTextarea,
  Select,
} from "./transition-settings-panel.styled";
import {
  ActionDialogPanel,
  ActionDialogBody,
  ActionPromptText,
  ActionMeta,
  LoraField,
} from "./action-dialog.styled";

interface Draft {
  prompt: string;
  /** A LoRA option key; empty for none. */
  loraKey: string;
}

interface Props {
  action: StudioAction;
  /** Its column, counting from 1. */
  index: number;
  heading: string;
  /** Clips it has in the matrix; any at all means it is edited as a copy. */
  clipCount: number;
  onClose: () => void;
  /** Check or uncheck every cell in its column, then close. */
  onCheckColumn: () => void;
  onUncheckColumn: () => void;
}

/**
 * Opened from a matrix column heading: the action's whole prompt to read, and
 * the way to change it. An action with clips keeps its settings, since those
 * made the clips, so editing it makes a copy in a new column; one without is
 * edited in place.
 */
export const ActionDialog: React.FC<Props> = ({
  action,
  index,
  heading,
  clipCount,
  onClose,
  onCheckColumn,
  onUncheckColumn,
}) => {
  const overlayRef = useLightboxA11y<HTMLDivElement>(onClose);
  const model = useStudioStore((s) => s.videoGenParams.model);
  const addAction = useStudioStore((s) => s.addAction);
  const updateAction = useStudioStore((s) => s.updateAction);
  const [draft, setDraft] = useState<Draft | null>(null);

  const copies = clipCount > 0;
  const loraOptions = getLoraOptionsForModel(model);
  const loraKey = action.highNoiseLoras?.[0]?.path ?? NO_LORA_OPTION.key;
  const lora = loraOptions.find((o) => o.key === loraKey);
  const canSave = draft !== null && draft.prompt.trim().length > 0;

  const save = () => {
    if (draft === null || !canSave) return;
    // The LoRA is only rewritten when it was changed, so one this model's
    // menu does not list is kept as it was.
    const loraChange =
      draft.loraKey === loraKey
        ? {}
        : (() => {
            const option =
              loraOptions.find((o) => o.key === draft.loraKey) ??
              NO_LORA_OPTION;
            return {
              highNoiseLoras: [...option.highNoiseLoras],
              lowNoiseLoras: [...option.lowNoiseLoras],
            };
          })();
    if (copies) {
      addAction({
        ...action,
        id: uuidv4(),
        prompt: draft.prompt,
        highNoiseLoras: action.highNoiseLoras?.map((l) => ({ ...l })),
        lowNoiseLoras: action.lowNoiseLoras?.map((l) => ({ ...l })),
        ...loraChange,
      });
    } else {
      updateAction(action.id, { prompt: draft.prompt, ...loraChange });
    }
    onClose();
  };

  return (
    <Overlay ref={overlayRef} tabIndex={-1} onClick={onClose}>
      <ActionDialogPanel
        role="dialog"
        aria-modal="true"
        aria-label={`Action ${index}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          <Title>
            {draft === null
              ? `Action ${index} · ${heading}`
              : copies
                ? `New action from ${index}`
                : `Edit action ${index}`}
          </Title>
          <CloseBtn onClick={onClose} aria-label="Close">
            &times;
          </CloseBtn>
        </Header>
        <ActionDialogBody>
          {draft === null ? (
            <ActionPromptText>{action.prompt}</ActionPromptText>
          ) : (
            <PromptTextarea
              value={draft.prompt}
              onChange={(e) => setDraft({ ...draft, prompt: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
              }}
              aria-label="Action prompt"
              autoFocus
              onFocus={(e) => {
                const end = e.currentTarget.value.length;
                e.currentTarget.setSelectionRange(end, end);
              }}
            />
          )}
          {draft !== null && loraOptions.length > 0 && (
            <LoraField>
              <FieldLabel htmlFor="action-dialog-lora">LoRA</FieldLabel>
              <Select
                id="action-dialog-lora"
                value={draft.loraKey}
                onChange={(e) =>
                  setDraft({ ...draft, loraKey: e.target.value })
                }
              >
                <option value={NO_LORA_OPTION.key}>
                  {NO_LORA_OPTION.label}
                </option>
                {loraOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </LoraField>
          )}
          <ActionMeta>
            {draft === null && lora ? `LoRA: ${lora.label} · ` : ""}
            {draft !== null && copies
              ? "Adds a column; the original and its clips stay as they are."
              : clipCount === 0
                ? "No clips in the matrix yet."
                : `${clipCount} ${
                    clipCount === 1 ? "clip" : "clips"
                  } in the matrix.`}
          </ActionMeta>
        </ActionDialogBody>
        <Footer>
          {draft === null ? (
            <FooterButtons>
              <CancelBtn onClick={onCheckColumn}>Check all</CancelBtn>
              <CancelBtn onClick={onUncheckColumn}>Uncheck all</CancelBtn>
            </FooterButtons>
          ) : (
            <span />
          )}
          <FooterButtons>
            {draft === null ? (
              <>
                <CancelBtn onClick={onClose}>Close</CancelBtn>
                <AddBtn
                  onClick={() => setDraft({ prompt: action.prompt, loraKey })}
                >
                  {copies ? "Duplicate & edit" : "Edit"}
                </AddBtn>
              </>
            ) : (
              <>
                <CancelBtn onClick={() => setDraft(null)}>Cancel</CancelBtn>
                <AddBtn onClick={save} disabled={!canSave}>
                  {copies ? "Add column" : "Save"}
                </AddBtn>
              </>
            )}
          </FooterButtons>
        </Footer>
      </ActionDialogPanel>
    </Overlay>
  );
};
