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
  DeleteBtn,
} from "./action-dialog.styled";

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
  /** Remove the action, discarding its clips; asks first if it has any. */
  onDelete: () => void;
}

const loraKeyOf = (action: StudioAction) =>
  action.highNoiseLoras?.[0]?.path ?? NO_LORA_OPTION.key;

const clipCountText = (clipCount: number) =>
  clipCount === 0
    ? "No clips in the matrix yet."
    : `${clipCount} ${clipCount === 1 ? "clip" : "clips"} in the matrix.`;

function DialogHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <Header>
      <Title>{title}</Title>
      <CloseBtn onClick={onClose} aria-label="Close">
        &times;
      </CloseBtn>
    </Header>
  );
}

function ActionDetails({
  action,
  index,
  heading,
  clipCount,
  editsCopy,
  onEdit,
  onClose,
  onCheckColumn,
  onUncheckColumn,
  onDelete,
}: Props & {
  editsCopy: boolean;
  onEdit: () => void;
}) {
  const model = useStudioStore((s) => s.videoGenParams.model);
  const lora = getLoraOptionsForModel(model).find(
    (o) => o.key === loraKeyOf(action),
  );

  return (
    <>
      <DialogHeader title={`Action ${index} · ${heading}`} onClose={onClose} />
      <ActionDialogBody>
        <ActionPromptText>{action.prompt}</ActionPromptText>
        <ActionMeta>
          {lora ? `LoRA: ${lora.label} · ` : ""}
          {clipCountText(clipCount)}
        </ActionMeta>
      </ActionDialogBody>
      <Footer>
        <FooterButtons>
          <CancelBtn onClick={onCheckColumn}>Check all</CancelBtn>
          <CancelBtn onClick={onUncheckColumn}>Uncheck all</CancelBtn>
          <DeleteBtn onClick={onDelete}>Delete</DeleteBtn>
        </FooterButtons>
        <FooterButtons>
          <CancelBtn onClick={onClose}>Close</CancelBtn>
          <AddBtn onClick={onEdit}>{editsCopy ? "Remix" : "Edit"}</AddBtn>
        </FooterButtons>
      </Footer>
    </>
  );
}

function ActionEditor({
  action,
  index,
  editsCopy,
  onCancel,
  onClose,
}: {
  action: StudioAction;
  index: number;
  editsCopy: boolean;
  onCancel: () => void;
  onClose: () => void;
}) {
  const model = useStudioStore((s) => s.videoGenParams.model);
  const addAction = useStudioStore((s) => s.addAction);
  const updateAction = useStudioStore((s) => s.updateAction);
  const loraOptions = getLoraOptionsForModel(model);
  const originalLoraKey = loraKeyOf(action);
  const [prompt, setPrompt] = useState(action.prompt);
  const [loraKey, setLoraKey] = useState(originalLoraKey);
  const canSave = prompt.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    // The LoRA is only rewritten when it was changed, so one this model's
    // menu does not list is kept as it was.
    const option =
      loraKey === originalLoraKey
        ? undefined
        : loraOptions.find((o) => o.key === loraKey) ?? NO_LORA_OPTION;
    const loraChange = option
      ? {
          highNoiseLoras: [...option.highNoiseLoras],
          lowNoiseLoras: [...option.lowNoiseLoras],
        }
      : {};
    if (editsCopy) {
      addAction({
        ...action,
        id: uuidv4(),
        prompt,
        highNoiseLoras: action.highNoiseLoras?.map((l) => ({ ...l })),
        lowNoiseLoras: action.lowNoiseLoras?.map((l) => ({ ...l })),
        ...loraChange,
      });
    } else {
      updateAction(action.id, { prompt, ...loraChange });
    }
    onClose();
  };

  return (
    <>
      <DialogHeader
        title={editsCopy ? `New action from ${index}` : `Edit action ${index}`}
        onClose={onClose}
      />
      <ActionDialogBody>
        <PromptTextarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
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
        {loraOptions.length > 0 && (
          <LoraField>
            <FieldLabel htmlFor="action-dialog-lora">LoRA</FieldLabel>
            <Select
              id="action-dialog-lora"
              value={loraKey}
              onChange={(e) => setLoraKey(e.target.value)}
            >
              <option value={NO_LORA_OPTION.key}>{NO_LORA_OPTION.label}</option>
              {loraOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </Select>
          </LoraField>
        )}
        <ActionMeta>
          {editsCopy
            ? "Adds a column; the original and its clips stay as they are."
            : clipCountText(0)}
        </ActionMeta>
      </ActionDialogBody>
      <Footer>
        <span />
        <FooterButtons>
          <CancelBtn onClick={onCancel}>Cancel</CancelBtn>
          <AddBtn onClick={save} disabled={!canSave}>
            {editsCopy ? "Add column" : "Save"}
          </AddBtn>
        </FooterButtons>
      </Footer>
    </>
  );
}

export const ActionDialog: React.FC<Props> = (props) => {
  const { action, index, clipCount, onClose } = props;
  const overlayRef = useLightboxA11y<HTMLDivElement>(onClose);
  const [editing, setEditing] = useState(false);
  const editsCopy = clipCount > 0;

  return (
    <Overlay ref={overlayRef} tabIndex={-1} onClick={onClose}>
      <ActionDialogPanel
        role="dialog"
        aria-modal="true"
        aria-label={`Action ${index}`}
        onClick={(e) => e.stopPropagation()}
      >
        {editing ? (
          <ActionEditor
            action={action}
            index={index}
            editsCopy={editsCopy}
            onCancel={() => setEditing(false)}
            onClose={onClose}
          />
        ) : (
          <ActionDetails
            {...props}
            editsCopy={editsCopy}
            onEdit={() => setEditing(true)}
          />
        )}
      </ActionDialogPanel>
    </Overlay>
  );
};
