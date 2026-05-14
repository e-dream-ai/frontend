import { useState, useMemo, useCallback } from "react";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import type { VideoModel } from "@/types/studio.types";
import { ACTION_PRESETS } from "@/components/pages/studio/constants/action-presets";
import {
  getAllowedDurationsForActions,
  clampDurationToAllowed,
} from "@/components/pages/studio/constants/duration-options";
import { resolvePresetAction } from "@/components/pages/studio/utils/resolve-flow-settings";
import {
  PanelContainer,
  PanelHeader,
  PanelTitle,
  PanelSubtitle,
  CloseButton,
  FieldRow,
  FieldGroup,
  FieldLabel,
  Select,
  PromptTextarea,
  GenerateButton,
  ToggleLink,
  ResetLink,
  ExpandedSection,
  AdvancedToggle,
  AdvancedFields,
  NumberInput,
} from "./transition-settings-panel.styled";

interface TransitionSettingsPanelProps {
  onGenerateAll: () => void;
  onGenerateOne: (index: number) => void;
  isGenerating: boolean;
}

export function TransitionSettingsPanel({
  onGenerateAll,
  onGenerateOne,
  isGenerating,
}: TransitionSettingsPanelProps) {
  const {
    transitions,
    keyframes,
    selectedTransitionIndex,
    settingsExpanded,
    globalPresetId,
    globalPrompt,
    globalDuration,
    globalModel,
    globalNumInferenceSteps,
    globalGuidance,
    setGlobalPreset,
    setGlobalPrompt,
    setGlobalDuration,
    setGlobalModel,
    setGlobalNumInferenceSteps,
    setGlobalGuidance,
    setTransitionOverride,
    clearTransitionOverride,
    selectTransition,
    setSettingsExpanded,
  } = useFlowStore(
    useShallow((s) => ({
      transitions: s.transitions,
      keyframes: s.keyframes,
      selectedTransitionIndex: s.selectedTransitionIndex,
      settingsExpanded: s.settingsExpanded,
      globalPresetId: s.globalPresetId,
      globalPrompt: s.globalPrompt,
      globalDuration: s.globalDuration,
      globalModel: s.globalModel,
      globalNumInferenceSteps: s.globalNumInferenceSteps,
      globalGuidance: s.globalGuidance,
      setGlobalPreset: s.setGlobalPreset,
      setGlobalPrompt: s.setGlobalPrompt,
      setGlobalDuration: s.setGlobalDuration,
      setGlobalModel: s.setGlobalModel,
      setGlobalNumInferenceSteps: s.setGlobalNumInferenceSteps,
      setGlobalGuidance: s.setGlobalGuidance,
      setTransitionOverride: s.setTransitionOverride,
      clearTransitionOverride: s.clearTransitionOverride,
      selectTransition: s.selectTransition,
      setSettingsExpanded: s.setSettingsExpanded,
    })),
  );

  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Per-transition mode?
  const isPerTransition = selectedTransitionIndex !== null;
  const selectedTransition =
    selectedTransitionIndex !== null
      ? transitions[selectedTransitionIndex]
      : null;

  // Effective values (override > global)
  const currentPresetId = selectedTransition?.presetOverride ?? globalPresetId;
  const currentPrompt = selectedTransition?.promptOverride ?? globalPrompt;
  const currentDuration =
    selectedTransition?.durationOverride ?? globalDuration;
  const currentModel = selectedTransition?.modelOverride ?? globalModel;
  const currentSteps =
    selectedTransition?.numInferenceStepsOverride ?? globalNumInferenceSteps;
  const currentGuidance =
    selectedTransition?.guidanceOverride ?? globalGuidance;

  // Filter presets by model
  const filteredPresets = useMemo(
    () =>
      ACTION_PRESETS.filter(
        (p) => p.model === currentModel || p.model === "all",
      ),
    [currentModel],
  );

  // Compute allowed durations
  const allowedDurations = useMemo(() => {
    if (!currentPresetId) {
      return getAllowedDurationsForActions([], currentModel);
    }
    const action = resolvePresetAction(currentPresetId);
    if (!action) return getAllowedDurationsForActions([], currentModel);
    return getAllowedDurationsForActions([action], currentModel);
  }, [currentPresetId, currentModel]);

  // Setter helpers — dispatch to override or global depending on mode
  const setValue = useCallback(
    (field: string, value: unknown) => {
      if (isPerTransition && selectedTransitionIndex !== null) {
        setTransitionOverride(selectedTransitionIndex, {
          [field]: value,
        });
      } else {
        switch (field) {
          case "presetOverride":
            setGlobalPreset(value as string);
            break;
          case "promptOverride":
            setGlobalPrompt(value as string);
            break;
          case "durationOverride":
            setGlobalDuration(value as number);
            break;
          case "modelOverride":
            setGlobalModel(value as VideoModel);
            break;
        }
      }
    },
    [
      isPerTransition,
      selectedTransitionIndex,
      setTransitionOverride,
      setGlobalPreset,
      setGlobalPrompt,
      setGlobalDuration,
      setGlobalModel,
    ],
  );

  const handlePresetChange = useCallback(
    (presetName: string) => {
      setValue("presetOverride", presetName || "");

      // Fill prompt from preset
      const action = resolvePresetAction(presetName);
      if (action) {
        setValue("promptOverride", action.prompt);
      }

      // Clamp duration if needed
      const newAllowed = presetName
        ? getAllowedDurationsForActions(action ? [action] : [], currentModel)
        : getAllowedDurationsForActions([], currentModel);
      const clamped = clampDurationToAllowed(currentDuration, newAllowed);
      if (clamped !== currentDuration) {
        setValue("durationOverride", clamped);
      }
    },
    [setValue, currentModel, currentDuration],
  );

  const handleModelChange = useCallback(
    (model: VideoModel) => {
      setValue("modelOverride", model);

      // Check if current preset is valid for new model
      if (currentPresetId) {
        const pack = ACTION_PRESETS.find((p) => p.name === currentPresetId);
        if (pack && pack.model !== "all" && pack.model !== model) {
          setValue("presetOverride", "");
        }
      }

      // Clamp duration to new model's allowed values
      const action = resolvePresetAction(currentPresetId);
      const newAllowed = action
        ? getAllowedDurationsForActions([action], model)
        : getAllowedDurationsForActions([], model);
      const clamped = clampDurationToAllowed(currentDuration, newAllowed);
      if (clamped !== currentDuration) {
        setValue("durationOverride", clamped);
      }
    },
    [setValue, currentPresetId, currentDuration],
  );

  // Generate All disabled?
  const generateAllDisabled =
    isGenerating ||
    transitions.length === 0 ||
    transitions.every((t) =>
      ["processed", "queue", "processing"].includes(t.status),
    );

  // Don't show if fewer than 2 keyframes
  if (keyframes.length < 2) return null;

  // Transition header info
  const fromName =
    selectedTransition &&
    keyframes.find((kf) => kf.id === selectedTransition.fromKeyframeId)?.name;
  const toName =
    selectedTransition &&
    keyframes.find((kf) => kf.id === selectedTransition.toKeyframeId)?.name;

  const isComplete = selectedTransition?.status === "processed";

  return (
    <PanelContainer>
      <PanelHeader>
        <div>
          <PanelTitle>Transition Settings</PanelTitle>
          {isPerTransition && fromName && toName && (
            <PanelSubtitle>
              {" "}
              &mdash; Editing: {fromName} &rarr; {toName}
            </PanelSubtitle>
          )}
        </div>
        {isPerTransition && (
          <CloseButton onClick={() => selectTransition(null)}>
            &times;
          </CloseButton>
        )}
      </PanelHeader>

      {/* Collapsed view */}
      <FieldRow>
        <FieldGroup>
          <FieldLabel>Preset</FieldLabel>
          <Select
            value={currentPresetId}
            onChange={(e) => handlePresetChange(e.target.value)}
          >
            <option value="">No preset</option>
            {filteredPresets.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Duration</FieldLabel>
          <Select
            value={currentDuration}
            onChange={(e) =>
              setValue("durationOverride", Number(e.target.value))
            }
          >
            {allowedDurations.map((d) => (
              <option key={d} value={d}>
                {d}s
              </option>
            ))}
          </Select>
        </FieldGroup>

        <GenerateButton
          $disabled={isPerTransition ? isGenerating : generateAllDisabled}
          disabled={isPerTransition ? isGenerating : generateAllDisabled}
          onClick={() => {
            if (isPerTransition && selectedTransitionIndex !== null) {
              onGenerateOne(selectedTransitionIndex);
            } else {
              onGenerateAll();
            }
          }}
        >
          {isPerTransition
            ? isComplete
              ? "Regenerate"
              : "Generate"
            : "Generate All"}
        </GenerateButton>
      </FieldRow>

      {/* Expand/collapse toggle */}
      {!settingsExpanded ? (
        <ToggleLink onClick={() => setSettingsExpanded(true)}>
          &#9662; Customize
        </ToggleLink>
      ) : (
        <>
          <ToggleLink onClick={() => setSettingsExpanded(false)}>
            &#9652; Collapse
          </ToggleLink>

          <ExpandedSection>
            <FieldGroup>
              <FieldLabel>Prompt</FieldLabel>
              <PromptTextarea
                value={currentPrompt}
                placeholder="Describe the transition motion..."
                onChange={(e) => setValue("promptOverride", e.target.value)}
              />
            </FieldGroup>

            <FieldRow>
              <FieldGroup>
                <FieldLabel>Model</FieldLabel>
                <Select
                  value={currentModel}
                  onChange={(e) =>
                    handleModelChange(e.target.value as VideoModel)
                  }
                >
                  <option value="wan-i2v">Wan I2V</option>
                  <option value="ltx-i2v">LTX 2.3</option>
                </Select>
              </FieldGroup>
            </FieldRow>

            <AdvancedToggle onClick={() => setAdvancedOpen(!advancedOpen)}>
              {advancedOpen ? "\u25BE" : "\u25B8"} Advanced (steps, guidance)
            </AdvancedToggle>

            {advancedOpen && (
              <AdvancedFields>
                <FieldGroup>
                  <FieldLabel>Steps</FieldLabel>
                  <NumberInput
                    type="number"
                    min={1}
                    max={100}
                    value={currentSteps}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (isPerTransition && selectedTransitionIndex !== null) {
                        setTransitionOverride(selectedTransitionIndex, {
                          numInferenceStepsOverride: val,
                        });
                      } else {
                        setGlobalNumInferenceSteps(val);
                      }
                    }}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>Guidance</FieldLabel>
                  <NumberInput
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    value={currentGuidance}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (isPerTransition && selectedTransitionIndex !== null) {
                        setTransitionOverride(selectedTransitionIndex, {
                          guidanceOverride: val,
                        });
                      } else {
                        setGlobalGuidance(val);
                      }
                    }}
                  />
                </FieldGroup>
              </AdvancedFields>
            )}
          </ExpandedSection>
        </>
      )}

      {/* Per-transition extras */}
      {isPerTransition && selectedTransitionIndex !== null && (
        <ResetLink
          onClick={() => clearTransitionOverride(selectedTransitionIndex)}
        >
          Reset to defaults
        </ResetLink>
      )}
    </PanelContainer>
  );
}
