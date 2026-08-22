import { useMemo, useCallback, useState } from "react";
import { useFlowStore, LOOP_FRAME_ID } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import type { LoRAConfig, VideoModel } from "@/types/studio.types";
import { useModels } from "@/api/model/query/useModels";
import { useModelConstraints } from "@/api/model/query/useModelConstraints";
import { CostEstimate } from "@/components/shared/cost-estimate/cost-estimate";
import { CreditLimitNotice } from "@/components/shared/credit-limit-notice/credit-limit-notice";
import { useCostEstimate } from "@/hooks/useCostEstimate";
import { useCreditGuard } from "@/hooks/useCreditGuard";
import { ACTION_PRESETS } from "@/components/pages/studio/constants/action-presets";
import {
  getAllowedDurationsForActions,
  clampDurationToAllowed,
} from "@/components/pages/studio/constants/duration-options";
import {
  GUIDANCE_PARAM,
  STEPS_PARAM,
  STEPS_TITLE,
  guidanceForModel,
  resolveGuidanceConstraint,
} from "@/components/pages/studio/constants/guidance-options";
import { SEED_HINT } from "@/components/pages/studio/constants/seed-options";
import { useSeedInput } from "@/components/pages/studio/hooks/useSeedInput";
import { GuidanceField } from "./guidance-field";
import { ForceSettingsDialog } from "./force-settings-dialog";
import { TransitionHistory } from "./transition-history";
import {
  getPresetGroups,
  resolvePresetAction,
} from "@/components/pages/studio/utils/resolve-flow-settings";
import { resolveNegativePromptSupport } from "@/components/pages/studio/utils/negative-prompt-support";
import { resolveGenerationTargets } from "@/components/pages/studio/utils/flow-generation-targets";
import {
  TRANSITION_FIELD_LABELS,
  selectionHasMismatch,
  type TransitionField,
  type TransitionGlobals,
} from "@/components/pages/studio/utils/transition-field-values";
import {
  PanelContainer,
  PanelHeader,
  PanelTitle,
  PanelSubtitle,
  PanelHeaderMain,
  HeaderActions,
  FieldRow,
  FieldGroup,
  FieldLabel,
  FieldHint,
  Select,
  PromptTextarea,
  GenerateButton,
  ToggleLink,
  ResetLink,
  ExpandedSection,
  ParamFields,
  ParamGroup,
  ParamTitle,
  ParamName,
  NumberInput,
  ValidationHint,
  RequiredMark,
} from "./transition-settings-panel.styled";

interface TransitionSettingsPanelProps {
  onGenerateAll: () => void;
  onGenerateSelected: (indices: readonly number[]) => void;
  isGenerating: boolean;
}

/** An edit held back until the user confirms flattening a mismatched field. */
interface PendingEdit {
  fieldLabel: string;
  count: number;
  run: () => void;
}

export function TransitionSettingsPanel({
  onGenerateAll,
  onGenerateSelected,
  isGenerating,
}: TransitionSettingsPanelProps) {
  // Data via useShallow (re-renders when any selected value changes).
  const {
    transitions,
    referenceFrames,
    selectedIndices,
    settingsExpanded,
    globalPresetId,
    globalPrompt,
    globalNegativePrompt,
    globalDuration,
    globalModel,
    globalNumInferenceSteps,
    globalGuidance,
    globalSeed,
    globalLora,
  } = useFlowStore(
    useShallow((s) => ({
      transitions: s.transitions,
      referenceFrames: s.referenceFrames,
      selectedIndices: s.selectedTransitionIndices,
      settingsExpanded: s.settingsExpanded,
      globalPresetId: s.globalPresetId,
      globalPrompt: s.globalPrompt,
      globalNegativePrompt: s.globalNegativePrompt,
      globalDuration: s.globalDuration,
      globalModel: s.globalModel,
      globalNumInferenceSteps: s.globalNumInferenceSteps,
      globalGuidance: s.globalGuidance,
      globalSeed: s.globalSeed,
      globalLora: s.globalLora,
    })),
  );

  const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null);

  const { data: modelsData } = useModels({ mediaType: "video" });
  const modelOptions = modelsData?.data?.models ?? [];
  const modelConstraints = useModelConstraints({ mediaType: "video" });

  // Per-transition mode? The last-clicked index is the "primary": the one the
  // panel names and whose values it displays when several are selected.
  const isPerTransition = selectedIndices.length > 0;
  const selectionCount = selectedIndices.length;
  const primaryIndex = isPerTransition
    ? selectedIndices[selectedIndices.length - 1]
    : null;
  const selectedTransition =
    primaryIndex !== null ? transitions[primaryIndex] : null;

  // Effective values (override > global > preset fallback)
  const currentPresetId = selectedTransition?.presetOverride ?? globalPresetId;
  const presetAction = useMemo(
    () => resolvePresetAction(currentPresetId),
    [currentPresetId],
  );
  const storedPrompt = selectedTransition?.promptOverride ?? globalPrompt;
  const currentPrompt = storedPrompt || presetAction?.prompt || "";
  const currentNegativePrompt =
    selectedTransition?.negativePromptOverride ?? globalNegativePrompt;
  const currentDuration =
    selectedTransition?.durationOverride ?? globalDuration;
  const currentModel = selectedTransition?.modelOverride ?? globalModel;
  const currentConstraints = modelConstraints.get(currentModel);
  const currentModelDurations = currentConstraints?.durationsSec;
  const supportsSteps = currentConstraints?.supportsSteps ?? true;
  const currentSteps =
    selectedTransition?.numInferenceStepsOverride ?? globalNumInferenceSteps;
  const currentGuidance =
    selectedTransition?.guidanceOverride ?? globalGuidance;
  const currentSeed = selectedTransition?.seedOverride ?? globalSeed;
  const guidanceConstraint = resolveGuidanceConstraint(
    currentModel,
    currentConstraints,
  );
  const guidanceParam = GUIDANCE_PARAM[currentModel];
  const { enabled: negativePromptEnabled, hint: negativePromptHint } =
    resolveNegativePromptSupport(modelOptions, currentModel);

  const presetGroups = useMemo(
    () => getPresetGroups(currentModel),
    [currentModel],
  );

  // Compute allowed durations
  const allowedDurations = useMemo(
    () =>
      getAllowedDurationsForActions(
        presetAction ? [presetAction] : [],
        currentModelDurations,
      ),
    [presetAction, currentModelDurations],
  );

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
    if (presetAction?.highNoiseLoras?.length) {
      return presetAction.highNoiseLoras[0].path;
    }
    return "";
  }, [selectedTransition?.loraOverride, globalLora, presetAction]);

  type FieldMap = {
    presetOverride: string;
    promptOverride: string;
    negativePromptOverride: string;
    durationOverride: number;
    modelOverride: VideoModel;
    numInferenceStepsOverride: number;
    guidanceOverride: number;
    seedOverride: number;
  };

  /**
   * Write one field to every target. `indices` empty means global mode — the
   * same edit lands on the flow-wide defaults instead.
   */
  const writeField = useCallback(
    <K extends keyof FieldMap>(
      indices: readonly number[],
      field: K,
      value: FieldMap[K],
    ) => {
      const store = useFlowStore.getState();
      if (indices.length > 0) {
        for (const index of indices) {
          store.setTransitionOverride(index, { [field]: value });
        }
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
        case "seedOverride":
          store.setGlobalSeed(value as number);
          break;
      }
    },
    [],
  );

  /**
   * Run an edit against the current selection, first checking whether it would
   * flatten a field the selected transitions disagree about. `gatedFields` are
   * the ones the user is directly editing — knock-on clamps (a duration the new
   * model can't do, say) follow the edit and aren't gated separately, or a
   * single interaction could raise several dialogs in a row.
   *
   * Store state is read via getState() inside the callback so this identity
   * stays stable across settings keystrokes.
   */
  const applyEdit = useCallback(
    (
      gatedFields: TransitionField[],
      run: (indices: readonly number[]) => void,
    ) => {
      const state = useFlowStore.getState();
      const indices = state.selectedTransitionIndices;
      if (indices.length > 1) {
        const selected = indices
          .map((i) => state.transitions[i])
          .filter((t): t is NonNullable<typeof t> => Boolean(t));
        const globals: TransitionGlobals = {
          globalPresetId: state.globalPresetId,
          globalPrompt: state.globalPrompt,
          globalNegativePrompt: state.globalNegativePrompt,
          globalDuration: state.globalDuration,
          globalModel: state.globalModel,
          globalNumInferenceSteps: state.globalNumInferenceSteps,
          globalGuidance: state.globalGuidance,
          globalSeed: state.globalSeed,
          globalLora: state.globalLora,
        };
        const clash = gatedFields.find((field) =>
          selectionHasMismatch(selected, globals, field),
        );
        if (clash) {
          setPendingEdit({
            fieldLabel: TRANSITION_FIELD_LABELS[clash],
            count: selected.length,
            run: () => run(indices),
          });
          return;
        }
      }
      run(indices);
    },
    [],
  );

  /** Edit a single field, gated on that same field. */
  const setValue = useCallback(
    <K extends keyof FieldMap>(field: K, value: FieldMap[K]) => {
      applyEdit([field as TransitionField], (indices) =>
        writeField(indices, field, value),
      );
    },
    [applyEdit, writeField],
  );

  const seedInput = useSeedInput(currentSeed, (seed) =>
    setValue("seedOverride", seed),
  );

  const handlePresetChange = useCallback(
    (presetName: string) => {
      applyEdit(["presetOverride"], (indices) => {
        writeField(indices, "presetOverride", presetName || "");

        // Fill prompt (and negative prompt) from preset. The negative is cleared
        // for presets that don't define one, so a previous preset's negative
        // never silently rides along on the next transition.
        const action = resolvePresetAction(presetName);
        if (action) {
          writeField(indices, "promptOverride", action.prompt);
          writeField(
            indices,
            "negativePromptOverride",
            action.negativePrompt ?? "",
          );
        }

        // Clear any explicit LoRA override so the preset's LoRA takes effect
        const store = useFlowStore.getState();
        if (indices.length > 0) {
          for (const index of indices) {
            store.setTransitionOverride(index, { loraOverride: undefined });
          }
        } else {
          store.setGlobalLora(undefined);
        }

        // Clamp duration if needed
        const newAllowed = getAllowedDurationsForActions(
          action ? [action] : [],
          currentModelDurations,
        );
        const clamped = clampDurationToAllowed(currentDuration, newAllowed);
        if (clamped !== currentDuration) {
          writeField(indices, "durationOverride", clamped);
        }
      });
    },
    [applyEdit, writeField, currentModelDurations, currentDuration],
  );

  const handleModelChange = useCallback(
    (model: VideoModel) => {
      applyEdit(["modelOverride"], (indices) => {
        writeField(indices, "modelOverride", model);

        const fixedDurations = modelConstraints.get(model)?.durationsSec;
        const newAllowed = getAllowedDurationsForActions(
          presetAction ? [presetAction] : [],
          fixedDurations,
        );
        const clamped = clampDurationToAllowed(currentDuration, newAllowed);
        if (clamped !== currentDuration) {
          writeField(indices, "durationOverride", clamped);
        }

        const nextConstraint = resolveGuidanceConstraint(
          model,
          modelConstraints.get(model),
        );
        const clampedGuidance = guidanceForModel(
          currentGuidance,
          nextConstraint,
        );
        if (clampedGuidance !== currentGuidance) {
          writeField(indices, "guidanceOverride", clampedGuidance);
        }
      });
    },
    [
      applyEdit,
      writeField,
      presetAction,
      currentDuration,
      currentGuidance,
      modelConstraints,
    ],
  );

  const handleLoraChange = useCallback(
    (loraKey: string) => {
      applyEdit(["loraOverride"], (indices) => {
        const loraOption = loraKey
          ? loraOptions.find((o) => o.key === loraKey)
          : undefined;
        const nextLora = loraOption?.highNoiseLoras ?? [];

        const store = useFlowStore.getState();
        if (indices.length > 0) {
          for (const index of indices) {
            store.setTransitionOverride(index, { loraOverride: nextLora });
          }
        } else {
          store.setGlobalLora(nextLora);
        }

        // Re-clamp duration against the new LoRA, since LoRAs can restrict durations.
        const clampAction = {
          prompt: presetAction?.prompt ?? "",
          highNoiseLoras: nextLora,
        };
        const newAllowed = getAllowedDurationsForActions(
          [clampAction],
          currentModelDurations,
        );
        const clamped = clampDurationToAllowed(currentDuration, newAllowed);
        if (clamped !== currentDuration) {
          writeField(indices, "durationOverride", clamped);
        }
      });
    },
    [
      applyEdit,
      writeField,
      loraOptions,
      presetAction,
      currentModelDurations,
      currentDuration,
    ],
  );

  // When no preset is selected, the prompt drives the generation —
  // so it becomes required. With a preset, the preset supplies a prompt.
  const needsPrompt = !presetAction && !currentPrompt.trim();

  const { targets: generateAllTargets } = useMemo(
    () => resolveGenerationTargets(transitions, referenceFrames),
    [transitions, referenceFrames],
  );

  const generateAllDisabled =
    isGenerating || generateAllTargets.length === 0 || needsPrompt;

  const generateSelectedDisabled = isGenerating || needsPrompt;

  const generateCount = isPerTransition
    ? selectionCount
    : generateAllTargets.length;
  const { totalCostUsd, costBreakdown } = useCostEstimate({
    model: modelOptions.find((m) => m.id === currentModel),
    params: { durationSec: currentDuration },
    count: generateCount,
    breakdownKey: "components.cost_estimate.clips",
  });
  const { overBudget, canManageKey, resetIn, guardOverBudget } =
    useCreditGuard(totalCostUsd);

  // Don't show if fewer than 2 referenceFrames
  if (referenceFrames.length < 2) return null;

  // Transition header info — __loop__ maps back to the first frame
  const findName = (id: string | undefined) =>
    id === LOOP_FRAME_ID
      ? referenceFrames[0]?.name
      : referenceFrames.find((frame) => frame.id === id)?.name;
  const fromName =
    selectedTransition && findName(selectedTransition.fromFrameId);
  const toName = selectedTransition && findName(selectedTransition.toFrameId);
  const extraCount = selectionCount - 1;

  const generateLabel = !isPerTransition
    ? "Generate All"
    : selectionCount > 1
      ? `Generate ${selectionCount} selected`
      : selectedTransition?.status === "processed"
        ? "Regenerate"
        : selectedTransition?.status === "failed"
          ? "Retry"
          : "Generate";

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelHeaderMain>
          <PanelTitle>Transition Settings</PanelTitle>
          {isPerTransition && fromName && toName && (
            <PanelSubtitle>
              {" "}
              &mdash; Editing: {fromName} &rarr; {toName}
              {extraCount > 0 && ` and ${extraCount} more`}
            </PanelSubtitle>
          )}
        </PanelHeaderMain>
        <HeaderActions>
          <TransitionHistory />
        </HeaderActions>
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
            {presetGroups.map((group) => (
              <optgroup key={group.id} label={group.label}>
                {group.presets.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
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

        <CostEstimate amountUsd={totalCostUsd} breakdown={costBreakdown} />

        <GenerateButton
          $disabled={
            isPerTransition ? generateSelectedDisabled : generateAllDisabled
          }
          disabled={
            isPerTransition ? generateSelectedDisabled : generateAllDisabled
          }
          title={
            needsPrompt
              ? "Add a prompt or pick a preset to generate"
              : undefined
          }
          onClick={() => {
            if (guardOverBudget()) return;
            if (isPerTransition) {
              onGenerateSelected(selectedIndices);
            } else {
              onGenerateAll();
            }
          }}
        >
          {generateLabel}
        </GenerateButton>
      </FieldRow>

      {needsPrompt && (
        <ValidationHint>
          Pick a preset or write a prompt to describe the motion.
        </ValidationHint>
      )}

      <CreditLimitNotice
        overBudget={overBudget}
        canManageKey={canManageKey}
        resetIn={resetIn}
      />

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
              <FieldLabel htmlFor="transition-negative-prompt">
                Negative Prompt
              </FieldLabel>
              <PromptTextarea
                id="transition-negative-prompt"
                value={currentNegativePrompt}
                placeholder="Describe what to avoid..."
                disabled={!negativePromptEnabled}
                aria-describedby={
                  negativePromptHint
                    ? "transition-negative-prompt-hint"
                    : undefined
                }
                onChange={(e) =>
                  setValue("negativePromptOverride", e.target.value)
                }
              />
              {negativePromptHint && (
                <FieldHint id="transition-negative-prompt-hint">
                  {negativePromptHint}
                </FieldHint>
              )}
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

            <ParamFields>
              {supportsSteps && (
                <ParamGroup>
                  <ParamTitle>{STEPS_TITLE}</ParamTitle>
                  <ParamName htmlFor="transition-steps">
                    {STEPS_PARAM}
                  </ParamName>
                  <NumberInput
                    id="transition-steps"
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
                </ParamGroup>
              )}
              {currentModel === "ltx-i2v" && (
                <ParamGroup>
                  <ParamTitle>Seed</ParamTitle>
                  <ParamName htmlFor="transition-seed">{SEED_HINT}</ParamName>
                  <NumberInput id="transition-seed" {...seedInput} />
                </ParamGroup>
              )}
              {guidanceConstraint && guidanceParam && (
                <GuidanceField
                  param={guidanceParam}
                  constraint={guidanceConstraint}
                  value={currentGuidance}
                  onChange={(guidance) =>
                    setValue("guidanceOverride", guidance)
                  }
                />
              )}
            </ParamFields>
          </ExpandedSection>
        </>
      )}

      {/* Per-transition extras */}
      {isPerTransition && (
        <ResetLink
          onClick={() => {
            const store = useFlowStore.getState();
            for (const index of store.selectedTransitionIndices) {
              store.clearTransitionOverride(index);
            }
          }}
        >
          {selectionCount > 1
            ? `Reset ${selectionCount} transitions to defaults`
            : "Reset to defaults"}
        </ResetLink>
      )}

      {pendingEdit && (
        <ForceSettingsDialog
          fieldLabel={pendingEdit.fieldLabel}
          count={pendingEdit.count}
          onConfirm={() => {
            pendingEdit.run();
            setPendingEdit(null);
          }}
          onCancel={() => setPendingEdit(null)}
        />
      )}
    </PanelContainer>
  );
}
