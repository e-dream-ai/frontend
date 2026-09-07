import React, { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import type { StudioAction } from "@/types/studio.types";
import { useStudioStore } from "@/stores/studio.store";
import {
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
import { isAnimatableFrame, isRunnableAction } from "../utils/batch-selectors";
import {
  ActionList,
  ActionRow,
  ActionLoraSelect,
  ActionInput,
  DeleteButton,
  SummaryBox,
  SummaryHighlight,
} from "./actions-tab.styled";

interface ActionRowItemProps {
  action: StudioAction;
  loraOptions: readonly LoraOption[];
  onUpdate: (id: string, updates: Partial<StudioAction>) => void;
  onRemove: (id: string) => void;
}

const ActionRowItem = React.memo(function ActionRowItem({
  action,
  loraOptions,
  onUpdate,
  onRemove,
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
      <ActionLoraSelect
        value={action.highNoiseLoras?.[0]?.path ?? NO_LORA_OPTION.key}
        onChange={handleLoraChange}
        disabled={loraOptions.length === 0}
        title="Camera-control LoRA applied to this action"
      >
        <option value={NO_LORA_OPTION.key}>{NO_LORA_OPTION.label}</option>
        {loraOptions.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </ActionLoraSelect>
      <ActionInput
        value={action.prompt}
        placeholder="Describe motion or transformation..."
        onChange={(e) => onUpdate(action.id, { prompt: e.target.value })}
      />
      <DeleteButton onClick={() => onRemove(action.id)}>&times;</DeleteButton>
    </ActionRow>
  );
});

export const ActionsTab: React.FC = () => {
  const actions = useStudioStore((s) => s.actions);
  const addAction = useStudioStore((s) => s.addAction);
  const updateAction = useStudioStore((s) => s.updateAction);
  const removeAction = useStudioStore((s) => s.removeAction);
  const images = useStudioStore((s) => s.images);
  const setActiveTab = useStudioStore((s) => s.setActiveTab);
  const model = useStudioStore((s) => s.videoGenParams.model);

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
    addAction({ id: uuidv4(), prompt: "" });
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
                onUpdate={updateAction}
                onRemove={removeAction}
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

      <BottomRow>
        <NavButton onClick={() => setActiveTab("images")}>
          &larr; Back to Images
        </NavButton>
        <NavButton onClick={() => setActiveTab("generate")}>
          Continue to Generate &rarr;
        </NavButton>
      </BottomRow>
    </>
  );
};
