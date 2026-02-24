import React from "react";
import { v4 as uuidv4 } from "uuid";
import { useStudioStore } from "@/stores/studio.store";
import {
  ACTION_PRESETS,
  createActionsFromPreset,
} from "../constants/action-presets";
import {
  GenerateSection,
  SectionTitle,
  FormRow,
  StyledSelect,
  NavButton,
  BottomRow,
} from "./images-tab.styled";
import {
  ActionList,
  ActionRow,
  ActionCheckbox,
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
  const loadPresetPack = useStudioStore((s) => s.loadPresetPack);
  const images = useStudioStore((s) => s.images);
  const setActiveTab = useStudioStore((s) => s.setActiveTab);

  const selectedImageCount = images.filter(
    (img) => img.selected && img.status === "processed",
  ).length;
  const enabledActionCount = actions.filter((a) => a.enabled).length;
  const totalVideos = selectedImageCount * enabledActionCount;

  const handleAddAction = () => {
    addAction({ id: uuidv4(), prompt: "", enabled: true });
  };

  const handleLoadPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetName = e.target.value;
    if (!presetName) return;
    const preset = ACTION_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      loadPresetPack(createActionsFromPreset(preset));
    }
    e.target.value = "";
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
          <StyledSelect onChange={handleLoadPreset} defaultValue="">
            <option value="" disabled>
              Load Preset Pack...
            </option>
            {ACTION_PRESETS.map((preset) => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </StyledSelect>
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
