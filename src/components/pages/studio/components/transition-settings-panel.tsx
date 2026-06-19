import { useState, useMemo, useCallback } from "react";
import { useFlowStore, LOOP_KEYFRAME_ID } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import type { LoRAConfig, VideoModel } from "@/types/studio.types";
import { useModels } from "@/api/model/query/useModels";
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
  ValidationHint,
  RequiredMark,
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
  // Data via useShallow (re-renders when any selected value changes).
  const {
    transitions,
    keyframes,
    selectedTransitionIndex,
    settingsExpanded,
    globalPresetId,
    globalPrompt,
    globalNegativePrompt,
    globalDuration,
    globalModel,
    globalNumInferenceSteps,
    globalGuidance,
    globalLora,
  } = useFlowStore(
    useShallow((s) => ({
      transitions: s.transitions,
      keyframes: s.keyframes,
      selectedTransitionIndex: s.selectedTransitionIndex,
      settingsExpanded: s.settingsExpanded,
      globalPresetId: s.globalPresetId,
      globalPrompt: s.globalPrompt,
      globalNegativePrompt: s.globalNegativePrompt,
      globalDuration: s.globalDuration,
      globalModel: s.globalModel,
      globalNumInferenceSteps: s.globalNumInferenceSteps,
      globalGuidance: s.globalGuidance,
      globalLora: s.globalLora,
    })),
  );

  const { data: modelsData } = useModels({ mediaType: "video" });
  const modelOptions = modelsData?.data?.models ?? [];

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
  const currentNegativePrompt =
    selectedTransition?.negativePromptOverride ?? globalNegativePrompt;
  const currentDuration =
    selectedTransition?.durationOverride ?? globalDuration;
  const currentModel = selectedTransition?.modelOverride ?? globalModel;
  const isKlingModel = currentModel.startsWith("kling");
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

  // Extract available LoRA options for the current model from preset packs.
  // Each unique LoRA (by path) becomes a selectable option.
  const loraOptions = useMemo(() => {
    const options: Array<{
      label: string;
      key: string;
      highNoiseLoras: LoRAConfig[];
      lowNoiseLoras: LoRAConfig[];
    }> = [];
    const seen = new Set<string>();

    for (const pack of ACTION_PRESETS) {
      if (pack.model !== currentModel && pack.model !== "all") continue;
      for (const action of pack.actions) {
        if (!action.highNoiseLoras?.length) continue;
        const path = action.highNoiseLoras[0].path;
        if (seen.has(path)) continue;
        seen.add(path);
        // Derive a short label from the action's prompt (first clause before comma)
        const label = action.prompt.split(",")[0].trim();
        options.push({
          label,
          key: path,
          highNoiseLoras: action.highNoiseLoras,
          lowNoiseLoras: action.lowNoiseLoras ?? [],
        });
      }
    }
    return options;
  }, [currentModel]);

  // Determine current effective LoRA: per-transition override > global > preset > none.
  // Returns the LoRA path key for matching against dropdown options.
  const currentLoraKey = useMemo(() => {
    const override = selectedTransition?.loraOverride ?? globalLora;
    if (override !== undefined) return override[0]?.path ?? "";
    const presetAction = resolvePresetAction(currentPresetId);
    if (presetAction?.highNoiseLoras?.length) {
      return presetAction.highNoiseLoras[0].path;
    }
    return "";
  }, [selectedTransition?.loraOverride, globalLora, currentPresetId]);

  type FieldMap = {
    presetOverride: string;
    promptOverride: string;
    negativePromptOverride: string;
    durationOverride: number;
    modelOverride: VideoModel;
    numInferenceStepsOverride: number;
    guidanceOverride: number;
  };
  const setValue = useCallback(
    <K extends keyof FieldMap>(field: K, value: FieldMap[K]) => {
      const store = useFlowStore.getState();
      if (isPerTransition && selectedTransitionIndex !== null) {
        store.setTransitionOverride(selectedTransitionIndex, {
          [field]: value,
        });
        return;
      }
      switch (field) {
        case "presetOverride":
          store.setGlobalPreset(value as string);
          break;
        case "promptOverride":
          store.setGlobalPrompt(value as string);
          break;
        case "negativePromptOverride":
          store.setGlobalNegativePrompt(value as string);
          break;
        case "durationOverride":
          store.setGlobalDuration(value as number);
          break;
        case "modelOverride":
          store.setGlobalModel(value as VideoModel);
          break;
        case "numInferenceStepsOverride":
          store.setGlobalNumInferenceSteps(value as number);
          break;
        case "guidanceOverride":
          store.setGlobalGuidance(value as number);
          break;
      }
    },
    [isPerTransition, selectedTransitionIndex],
  );

  const handlePresetChange = useCallback(
    (presetName: string) => {
      setValue("presetOverride", presetName || "");

      // Fill prompt from preset
      const action = resolvePresetAction(presetName);
      if (action) {
        setValue("promptOverride", action.prompt);
      }

      // Clear any explicit LoRA override so the preset's LoRA takes effect
      const store = useFlowStore.getState();
      if (isPerTransition && selectedTransitionIndex !== null) {
        store.setTransitionOverride(selectedTransitionIndex, {
          loraOverride: undefined,
        });
      } else {
        store.setGlobalLora(undefined);
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
    [
      setValue,
      currentModel,
      currentDuration,
      isPerTransition,
      selectedTransitionIndex,
    ],
  );

  const handleModelChange = useCallback(
    (model: VideoModel) => {
      setValue("modelOverride", model);

      const action = resolvePresetAction(currentPresetId);
      const newAllowed = getAllowedDurationsForActions(
        action ? [action] : [],
        model,
      );
      const clamped = clampDurationToAllowed(currentDuration, newAllowed);
      if (clamped !== currentDuration) {
        setValue("durationOverride", clamped);
      }
    },
    [currentPresetId, currentDuration, setValue],
  );

  const handleLoraChange = useCallback(
    (loraKey: string) => {
      const loraOption = loraKey
        ? loraOptions.find((o) => o.key === loraKey)
        : undefined;
      const nextLora = loraOption?.highNoiseLoras ?? [];

      const store = useFlowStore.getState();
      if (isPerTransition && selectedTransitionIndex !== null) {
        store.setTransitionOverride(selectedTransitionIndex, {
          loraOverride: nextLora,
        });
      } else {
        store.setGlobalLora(nextLora);
      }

      // Re-clamp duration against the new LoRA, since LoRAs can restrict durations.
      const baseAction = resolvePresetAction(currentPresetId);
      const clampAction = {
        prompt: baseAction?.prompt ?? "",
        highNoiseLoras: nextLora,
      };
      const newAllowed = getAllowedDurationsForActions(
        [clampAction],
        currentModel,
      );
      const clamped = clampDurationToAllowed(currentDuration, newAllowed);
      if (clamped !== currentDuration) {
        setValue("durationOverride", clamped);
      }
    },
    [
      isPerTransition,
      selectedTransitionIndex,
      loraOptions,
      currentPresetId,
      currentModel,
      currentDuration,
      setValue,
    ],
  );

  // When no preset is selected, the prompt drives the generation —
  // so it becomes required. With a preset, the preset supplies a prompt.
  const needsPrompt = !currentPresetId && !currentPrompt.trim();

  // Generate All disabled?
  const generateAllDisabled =
    isGenerating ||
    transitions.length === 0 ||
    transitions.every((t) =>
      ["processed", "queue", "processing"].includes(t.status),
    ) ||
    needsPrompt;

  const generateOneDisabled = isGenerating || needsPrompt;

  // Don't show if fewer than 2 keyframes
  if (keyframes.length < 2) return null;

  // Transition header info — __loop__ maps back to the first keyframe
  const findName = (id: string | undefined) =>
    id === LOOP_KEYFRAME_ID
      ? keyframes[0]?.name
      : keyframes.find((kf) => kf.id === id)?.name;
  const fromName =
    selectedTransition && findName(selectedTransition.fromKeyframeId);
  const toName =
    selectedTransition && findName(selectedTransition.toKeyframeId);

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
          <CloseButton
            onClick={() => useFlowStore.getState().selectTransition(null)}
          >
            &times;
          </CloseButton>
        )}
      </PanelHeader>

      {/* Collapsed view */}
      <FieldRow>
        {modelOptions.length > 0 && (
          <FieldGroup>
            <FieldLabel>Model</FieldLabel>
            <Select
              value={currentModel}
              onChange={(e) => handleModelChange(e.target.value as VideoModel)}
            >
              {modelOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </Select>
          </FieldGroup>
        )}

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
          $disabled={
            isPerTransition ? generateOneDisabled : generateAllDisabled
          }
          disabled={isPerTransition ? generateOneDisabled : generateAllDisabled}
          title={
            needsPrompt
              ? "Add a prompt or pick a preset to generate"
              : undefined
          }
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

      {needsPrompt && (
        <ValidationHint>
          Pick a preset or write a prompt to describe the motion.
        </ValidationHint>
      )}

      {/* Expand/collapse toggle */}
      {!settingsExpanded ? (
        <ToggleLink
          onClick={() => useFlowStore.getState().setSettingsExpanded(true)}
        >
          &#9662; Customize
        </ToggleLink>
      ) : (
        <>
          <ToggleLink
            onClick={() => useFlowStore.getState().setSettingsExpanded(false)}
          >
            &#9652; Collapse
          </ToggleLink>

          <ExpandedSection>
            <FieldGroup>
              <FieldLabel>
                Prompt
                {needsPrompt && <RequiredMark>*</RequiredMark>}
              </FieldLabel>
              <PromptTextarea
                value={currentPrompt}
                placeholder="Describe the transition motion..."
                $invalid={needsPrompt}
                onChange={(e) => setValue("promptOverride", e.target.value)}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Negative Prompt</FieldLabel>
              <PromptTextarea
                value={currentNegativePrompt}
                placeholder="Describe what to avoid..."
                onChange={(e) =>
                  setValue("negativePromptOverride", e.target.value)
                }
              />
            </FieldGroup>

            <FieldRow>
              {loraOptions.length > 0 && (
                <FieldGroup>
                  <FieldLabel>LoRA</FieldLabel>
                  <Select
                    value={currentLoraKey}
                    onChange={(e) => handleLoraChange(e.target.value)}
                  >
                    <option value="">None</option>
                    {loraOptions.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </FieldGroup>
              )}
            </FieldRow>

            <AdvancedToggle onClick={() => setAdvancedOpen(!advancedOpen)}>
              {advancedOpen ? "\u25BE" : "\u25B8"} Advanced
              {isKlingModel ? " (guidance)" : " (steps, guidance)"}
            </AdvancedToggle>

            {advancedOpen && (
              <AdvancedFields>
                {!isKlingModel && (
                  <FieldGroup>
                    <FieldLabel>Steps</FieldLabel>
                    <NumberInput
                      type="number"
                      min={1}
                      max={100}
                      value={currentSteps}
                      onChange={(e) =>
                        setValue(
                          "numInferenceStepsOverride",
                          Number(e.target.value),
                        )
                      }
                    />
                  </FieldGroup>
                )}
                <FieldGroup>
                  <FieldLabel>Guidance</FieldLabel>
                  <NumberInput
                    type="number"
                    min={0}
                    max={20}
                    step={0.5}
                    value={currentGuidance}
                    onChange={(e) =>
                      setValue("guidanceOverride", Number(e.target.value))
                    }
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
          onClick={() =>
            useFlowStore
              .getState()
              .clearTransitionOverride(selectedTransitionIndex)
          }
        >
          Reset to defaults
        </ResetLink>
      )}
    </PanelContainer>
  );
}
