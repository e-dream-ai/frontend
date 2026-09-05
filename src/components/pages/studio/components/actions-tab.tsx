import React, { useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useStudioStore } from "@/stores/studio.store";
import {
  getLoraOptionsForModel,
  NO_LORA_OPTION,
} from "../constants/lora-options";
import {
  GenerateSection,
  SectionTitle,
  FormRow,
  NavButton,
  BottomRow,
} from "./images-tab.styled";
import {
  ActionList,
  ActionRow,
  ActionCheckbox,
  ActionLoraSelect,
  ActionInput,
  DeleteButton,
  SummaryBox,
  SummaryHighlight,
} from "./actions-tab.styled";

export const ActionsTab: React.FC = () => {
  const actions = useStudioStore((s) => s.actions);
  const addAction = useStudioStore((s) => s.addAction);
  const updateAction = useStudioStore((s) => s.updateAction);
  const removeAction = useStudioStore((s) => s.removeAction);
  const toggleActionEnabled = useStudioStore((s) => s.toggleActionEnabled);
  const images = useStudioStore((s) => s.images);
  const setActiveTab = useStudioStore((s) => s.setActiveTab);
  const videoGenParams = useStudioStore((s) => s.videoGenParams);

  const loraOptions = useMemo(
    () => getLoraOptionsForModel(videoGenParams.model),
    [videoGenParams.model],
  );

  const selectedImageCount = useMemo(
    () =>
      images.filter((img) => img.selected && img.status === "processed").length,
    [images],
  );
  const enabledActionCount = useMemo(
    () => actions.filter((a) => a.enabled).length,
    [actions],
  );
  const totalVideos = selectedImageCount * enabledActionCount;

  const handleAddAction = () => {
    addAction({ id: uuidv4(), prompt: "", enabled: true });
  };

  const handleLoraChange = useCallback(
    (actionId: string, key: string) => {
      const option = loraOptions.find((o) => o.key === key) ?? NO_LORA_OPTION;
      updateAction(actionId, {
        highNoiseLoras: option.highNoiseLoras,
        lowNoiseLoras: option.lowNoiseLoras,
      });
    },
    [loraOptions, updateAction],
  );

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
          These prompts describe camera motion or transformations. Each selected
          image will be animated with each enabled action.
        </p>

        {actions.length > 0 && (
          <ActionList>
            {actions.map((action) => (
              <ActionRow key={action.id}>
                <ActionCheckbox
                  checked={action.enabled}
                  onChange={() => toggleActionEnabled(action.id)}
                />
                <ActionLoraSelect
                  value={action.highNoiseLoras?.[0]?.path ?? ""}
                  onChange={(e) => handleLoraChange(action.id, e.target.value)}
                  disabled={loraOptions.length === 0}
                  title="Camera-control LoRA applied to this action"
                >
                  <option value="">{NO_LORA_OPTION.label}</option>
                  {loraOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </ActionLoraSelect>
                <ActionInput
                  value={action.prompt}
                  placeholder="Describe motion or transformation..."
                  onChange={(e) =>
                    updateAction(action.id, { prompt: e.target.value })
                  }
                />
                <DeleteButton onClick={() => removeAction(action.id)}>
                  &times;
                </DeleteButton>
              </ActionRow>
            ))}
          </ActionList>
        )}

        <FormRow>
          <NavButton onClick={handleAddAction}>+ Add Action</NavButton>
        </FormRow>
      </GenerateSection>

      <SummaryBox>
        <SummaryHighlight>{selectedImageCount}</SummaryHighlight> images
        selected &times;{" "}
        <SummaryHighlight>{enabledActionCount}</SummaryHighlight> actions
        enabled = <SummaryHighlight>{totalVideos}</SummaryHighlight> videos
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
