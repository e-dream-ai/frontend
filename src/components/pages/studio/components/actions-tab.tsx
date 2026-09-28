import React, { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { StudioAction } from "@/types/studio.types";
import { useStudioStore } from "@/stores/studio.store";
import { useRemoveStudioAction } from "../hooks/useStudioClipActions";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import {
  getDefaultLoraOption,
  getLoraOptionsForModel,
  NO_LORA_OPTION,
  type LoraOption,
} from "../constants/lora-options";
import {
  GenerateSection,
  SectionTitle,
  FormRow,
  NavButton,
  BottomRow,
} from "./images-tab.styled";
import {
  isAnimatableFrame,
  isRunnableAction,
  actionClipCounts,
} from "../utils/batch-selectors";
import {
  ActionList,
  ActionRow,
  ActionLoraSelect,
  ActionInput,
  ActionIndex,
  DeleteButton,
  EditCopyButton,
  EditCopySpacer,
  SummaryBox,
  SummaryHighlight,
} from "./actions-tab.styled";

interface ActionRowItemProps {
  action: StudioAction;
  /** Empty for a model without LoRAs, which hides the menu. */
  loraOptions: readonly LoraOption[];
  /** Its matrix column, counting from 1; none while its prompt is empty. */
  column?: number;
  /** Has clips in the matrix: read-only, edited by way of a copy. */
  locked: boolean;
  /** A copy just made to edit, which takes the focus. */
  autoFocus: boolean;
  onUpdate: (id: string, updates: Partial<StudioAction>) => void;
  onRemove: (id: string) => void;
  onEditCopy: (action: StudioAction) => void;
}

const ActionRowItem = React.memo(function ActionRowItem({
  action,
  loraOptions,
  column,
  locked,
  autoFocus,
  onUpdate,
  onRemove,
  onEditCopy,
}: ActionRowItemProps) {
  const handleLoraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const option =
      loraOptions.find((o) => o.key === e.target.value) ?? NO_LORA_OPTION;
    onUpdate(action.id, {
      highNoiseLoras: [...option.highNoiseLoras],
      lowNoiseLoras: [...option.lowNoiseLoras],
    });
  };

  return (
    <ActionRow>
      <ActionIndex
        title={column ? `Column ${column} in the matrix` : undefined}
      >
        {column}
      </ActionIndex>
      <DeleteButton onClick={() => onRemove(action.id)}>&times;</DeleteButton>
      {locked ? (
        <EditCopyButton
          onClick={() => onEditCopy(action)}
          aria-label="Edit a copy of this action"
          title="Edit a copy of this action"
        >
          <Pencil size={14} />
        </EditCopyButton>
      ) : (
        <EditCopySpacer aria-hidden="true" />
      )}
      {loraOptions.length > 0 && (
        <ActionLoraSelect
          value={action.highNoiseLoras?.[0]?.path ?? NO_LORA_OPTION.key}
          onChange={handleLoraChange}
          disabled={locked}
          title="Camera-control LoRA applied to this action"
        >
          <option value={NO_LORA_OPTION.key}>{NO_LORA_OPTION.label}</option>
          {loraOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </ActionLoraSelect>
      )}
      <ActionInput
        value={action.prompt}
        placeholder="Describe motion or transformation..."
        readOnly={locked}
        autoFocus={autoFocus}
        title={
          locked
            ? "Has clips in the matrix. Use the pencil to edit a copy."
            : undefined
        }
        onChange={(e) => onUpdate(action.id, { prompt: e.target.value })}
      />
    </ActionRow>
  );
});

export const ActionsTab: React.FC = () => {
  const actions = useStudioStore((s) => s.actions);
  const addAction = useStudioStore((s) => s.addAction);
  const updateAction = useStudioStore((s) => s.updateAction);
  const removeAction = useRemoveStudioAction();
  const images = useStudioStore((s) => s.images);
  const setActiveTab = useStudioStore((s) => s.setActiveTab);
  const model = useStudioStore((s) => s.videoGenParams.model);
  const jobs = useStudioStore((s) => s.jobs);
  const clipCounts = useMemo(
    () => actionClipCounts(images, jobs),
    [images, jobs],
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // Numbered as the matrix numbers its columns, which skip empty prompts.
  const columns = useMemo(() => {
    const byId = new Map<string, number>();
    for (const action of actions.filter(isRunnableAction)) {
      byId.set(action.id, byId.size + 1);
    }
    return byId;
  }, [actions]);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const confirmRemoveCount = confirmRemoveId
    ? clipCounts.get(confirmRemoveId) ?? 0
    : 0;

  // An action in use takes its clips with it, so that asks first.
  const handleRemove = (id: string) => {
    if (clipCounts.has(id)) setConfirmRemoveId(id);
    else removeAction(id);
  };

  const loraOptions = getLoraOptionsForModel(model);

  const frameCount = useMemo(
    () => images.filter(isAnimatableFrame).length,
    [images],
  );
  const actionCount = useMemo(
    () => actions.filter(isRunnableAction).length,
    [actions],
  );
  const totalVideos = frameCount * actionCount;

  const handleAddAction = () => {
    const lora = getDefaultLoraOption(model);
    addAction({
      id: uuidv4(),
      prompt: "",
      highNoiseLoras: [...lora.highNoiseLoras],
      lowNoiseLoras: [...lora.lowNoiseLoras],
    });
  };

  const handleEditCopy = (action: StudioAction) => {
    const id = uuidv4();
    addAction({
      ...action,
      id,
      highNoiseLoras: action.highNoiseLoras?.map((l) => ({ ...l })),
      lowNoiseLoras: action.lowNoiseLoras?.map((l) => ({ ...l })),
    });
    setCopiedId(id);
  };

  return (
    <>
      <GenerateSection>
        <SectionTitle>Action Prompts</SectionTitle>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "#888",
            marginBottom: "1rem",
          }}
        >
          These prompts describe camera motion or transformations. Each
          reference frame will be animated with every action below.
        </p>

        {actions.length > 0 && (
          <ActionList>
            {actions.map((action) => (
              <ActionRowItem
                key={action.id}
                action={action}
                loraOptions={loraOptions}
                column={columns.get(action.id)}
                locked={clipCounts.has(action.id)}
                autoFocus={action.id === copiedId}
                onUpdate={updateAction}
                onRemove={handleRemove}
                onEditCopy={handleEditCopy}
              />
            ))}
          </ActionList>
        )}

        <FormRow>
          <NavButton onClick={handleAddAction}>+ Add Action</NavButton>
        </FormRow>
      </GenerateSection>

      <SummaryBox>
        <SummaryHighlight>{frameCount}</SummaryHighlight> frames &times;{" "}
        <SummaryHighlight>{actionCount}</SummaryHighlight> actions ={" "}
        <SummaryHighlight>{totalVideos}</SummaryHighlight> videos
      </SummaryBox>

      <ConfirmModal
        isOpen={confirmRemoveId !== null}
        title="Remove action?"
        text={`This action has ${confirmRemoveCount} ${
          confirmRemoveCount === 1 ? "clip" : "clips"
        } in the matrix. Removing it discards them: they leave the matrix and the output playlist.`}
        confirmText="Remove"
        confirmButtonType="danger"
        onCancel={() => setConfirmRemoveId(null)}
        onConfirm={() => {
          if (confirmRemoveId) removeAction(confirmRemoveId);
          setConfirmRemoveId(null);
        }}
      />

      <BottomRow>
        <NavButton onClick={() => setActiveTab("images")}>
          &larr; Back to Images
        </NavButton>
        <NavButton onClick={() => setActiveTab("generate")}>
          Continue to Matrix &rarr;
        </NavButton>
      </BottomRow>
    </>
  );
};
