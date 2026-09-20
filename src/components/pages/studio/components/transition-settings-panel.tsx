import { useMemo, useCallback, useState } from "react";
import {
  useFlowStore,
  LOOP_FRAME_ID,
  DEFAULT_TRANSITION_SETTINGS,
} from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import type { LoRAConfig, VideoModel } from "@/types/studio.types";
import type { TransitionSettings } from "@/types/flow.types";
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
import { formatRunTime } from "@/components/pages/studio/utils/transition-history.util";
import {
  getPresetGroups,
  matchingPresetName,
  presetSettingsPatch,
} from "@/components/pages/studio/utils/resolve-flow-settings";
import { resolveNegativePromptSupport } from "@/components/pages/studio/utils/negative-prompt-support";
import {
  resolveGenerationTargets,
  resolveSelectedTargets,
} from "@/components/pages/studio/utils/flow-generation-targets";
import {
  selectionHasMismatch,
  type TransitionField,
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
  ScopeHint,
  ValidationHint,
  RequiredMark,
  SubtitleTime,
} from "./transition-settings-panel.styled";

interface TransitionSettingsPanelProps {
  onGenerateAll: () => void;
  onGenerateSelected: (indices: readonly number[]) => void;
  isGenerating: boolean;
}

/**
 * An edit held back until the user confirms flattening a mismatched field.
 *
 * A selection is unified when it is made (see reference-frame-strip), so this
 * is a backstop, not the usual path: rebuilding the transition list — a
 * reference frame reordered or removed — can leave already-selected indices
 * pointing at transitions that no longer agree.
 */
interface PendingEdit {
  run: () => void;
}

export function TransitionSettingsPanel({
  onGenerateAll,
  onGenerateSelected,
  isGenerating,
}: TransitionSettingsPanelProps) {
  // Data via useShallow (re-renders when any selected value changes).
  const { transitions, referenceFrames, selectedIndices, settingsExpanded } =
    useFlowStore(
      useShallow((s) => ({
        transitions: s.transitions,
        referenceFrames: s.referenceFrames,
        selectedIndices: s.selectedTransitionIndices,
        settingsExpanded: s.settingsExpanded,
      })),
    );

  const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null);

  const { data: modelsData } = useModels({ mediaType: "video" });
  const modelOptions = modelsData?.data?.models ?? [];
  const modelConstraints = useModelConstraints({ mediaType: "video" });

  const isPerTransition = selectedIndices.length > 0;
  const selectionCount = selectedIndices.length;
  const primaryIndex = isPerTransition
    ? selectedIndices[selectedIndices.length - 1]
    : null;
  const selectedTransition =
    primaryIndex !== null ? transitions[primaryIndex] : null;

  const current = selectedTransition?.settings ?? DEFAULT_TRANSITION_SETTINGS;
  const currentPrompt = current.prompt;
  const currentNegativePrompt = current.negativePrompt;
  const currentDuration = current.duration;
  const currentModel = current.model;
  const currentConstraints = modelConstraints.get(currentModel);
  const currentModelDurations = currentConstraints?.durationsSec;
  const supportsSteps = currentConstraints?.supportsSteps ?? true;
  const currentSteps = current.steps;
  const currentGuidance = current.guidance;
  const currentSeed = current.seed;

  // Durations are restricted by whichever LoRAs are actually stored, so the
  // clamp reads the settings rather than the preset they may have come from.
  const currentAction = useMemo(
    () => ({
      prompt: current.prompt,
      highNoiseLoras: current.highNoiseLoras,
      lowNoiseLoras: current.lowNoiseLoras,
    }),
    [current.prompt, current.highNoiseLoras, current.lowNoiseLoras],
  );
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

  /** The preset these settings still match, or "" for Custom. */
  const currentPresetName = useMemo(
    () =>
      matchingPresetName(
        current,
        presetGroups.flatMap((g) => g.presets),
      ),
    [current, presetGroups],
  );

  // Compute allowed durations
  const allowedDurations = useMemo(
    () => getAllowedDurationsForActions([currentAction], currentModelDurations),
    [currentAction, currentModelDurations],
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

  /** The stored LoRA, as the path key the dropdown matches on. */
  const currentLoraKey = current.highNoiseLoras[0]?.path ?? "";

  /** Write fields to every selected transition. The only settings write. */
  const writeFields = useCallback(
    (indices: readonly number[], patch: Partial<TransitionSettings>) => {
      useFlowStore.getState().setTransitionSettings(indices, patch);
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
        const clash = gatedFields.find((field) =>
          selectionHasMismatch(selected, field),
        );
        if (clash) {
          setPendingEdit({ run: () => run(indices) });
          return;
        }
      }
      run(indices);
    },
    [],
  );

  /** Edit a single field, gated on that same field. */
  const setValue = useCallback(
    <K extends keyof TransitionSettings>(
      field: K,
      value: TransitionSettings[K],
    ) => {
      applyEdit([field], (indices) =>
        writeFields(indices, { [field]: value } as Partial<TransitionSettings>),
      );
    },
    [applyEdit, writeFields],
  );

  const seedInput = useSeedInput(currentSeed, (seed) => setValue("seed", seed));

  /**
   * Apply a preset: stamp its prompt, negative prompt and LoRAs into the
   * selection, then forget it. Nothing records which preset ran — the fields it
   * wrote are visible in the panel and editable like any others.
   */
  const handleApplyPreset = useCallback(
    (presetName: string) => {
      if (!presetName) return;
      const patch = presetSettingsPatch(presetName);
      if (!patch) return;
      applyEdit(
        ["prompt", "negativePrompt", "highNoiseLoras", "lowNoiseLoras"],
        (indices) => {
          // Clamp duration against the LoRAs the preset just wrote, which can
          // restrict what the model will accept.
          const newAllowed = getAllowedDurationsForActions(
            [
              {
                highNoiseLoras: patch.highNoiseLoras,
                lowNoiseLoras: patch.lowNoiseLoras,
              },
            ],
            currentModelDurations,
          );
          const clamped = clampDurationToAllowed(currentDuration, newAllowed);
          writeFields(indices, {
            ...patch,
            ...(clamped !== currentDuration && { duration: clamped }),
          });
        },
      );
    },
    [applyEdit, writeFields, currentModelDurations, currentDuration],
  );

  const handleModelChange = useCallback(
    (model: VideoModel) => {
      applyEdit(["model"], (indices) => {
        const fixedDurations = modelConstraints.get(model)?.durationsSec;
        const newAllowed = getAllowedDurationsForActions(
          [currentAction],
          fixedDurations,
        );
        const clamped = clampDurationToAllowed(currentDuration, newAllowed);
        const nextConstraint = resolveGuidanceConstraint(
          model,
          modelConstraints.get(model),
        );
        const clampedGuidance = guidanceForModel(
          currentGuidance,
          nextConstraint,
        );
        writeFields(indices, {
          model,
          ...(clamped !== currentDuration && { duration: clamped }),
          ...(clampedGuidance !== currentGuidance && {
            guidance: clampedGuidance,
          }),
        });
      });
    },
    [
      applyEdit,
      writeFields,
      currentAction,
      currentDuration,
      currentGuidance,
      modelConstraints,
    ],
  );

  const handleLoraChange = useCallback(
    (loraKey: string) => {
      applyEdit(["highNoiseLoras", "lowNoiseLoras"], (indices) => {
        const option = loraKey
          ? loraOptions.find((o) => o.key === loraKey)
          : undefined;
        // Both halves move together. The low-noise set used to be recovered by
        // matching the high-noise one back to a preset; storing it here is what
        // lets a LoRA keep its pair without that lookup.
        const highNoiseLoras = option?.highNoiseLoras ?? [];
        const lowNoiseLoras = option?.lowNoiseLoras ?? [];

        const newAllowed = getAllowedDurationsForActions(
          [{ highNoiseLoras, lowNoiseLoras }],
          currentModelDurations,
        );
        const clamped = clampDurationToAllowed(currentDuration, newAllowed);
        writeFields(indices, {
          highNoiseLoras,
          lowNoiseLoras,
          ...(clamped !== currentDuration && { duration: clamped }),
        });
      });
    },
    [
      applyEdit,
      writeFields,
      loraOptions,
      currentModelDurations,
      currentDuration,
    ],
  );

  // What each mode would actually start. This count drives the cost estimate
  // sitting beside the button, so the clips it prices are the dreams the click
  // produces — not the number of things on screen.
  const { targets: generateAllTargets } = useMemo(
    () => resolveGenerationTargets(transitions, referenceFrames),
    [transitions, referenceFrames],
  );

  const { targets: generateSelectedTargets } = useMemo(
    () => resolveSelectedTargets(selectedIndices, transitions, referenceFrames),
    [selectedIndices, transitions, referenceFrames],
  );

  const generateTargets = isPerTransition
    ? generateSelectedTargets
    : generateAllTargets;
  const generateCount = generateTargets.length;

  const needsPrompt = generateTargets.some(
    (target) => !target.transition.settings.prompt.trim(),
  );

  const generateDisabled = isGenerating || generateCount === 0 || needsPrompt;

  const costBasis =
    selectedTransition?.settings ?? generateTargets[0]?.transition.settings;
  const { totalCostUsd, costBreakdown } = useCostEstimate({
    model: modelOptions.find(
      (m) => m.id === (costBasis?.model ?? currentModel),
    ),
    params: { durationSec: costBasis?.duration ?? currentDuration },
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
  // The take the flow is actually using — the same entry the history rail marks
  // as current, so the two labels always agree.
  const currentRun = selectedTransition?.dreamUuid
    ? selectedTransition.history?.find(
        (entry) =>
          entry.completed && entry.dreamUuid === selectedTransition.dreamUuid,
      )
    : undefined;
  const currentRunTime = currentRun && formatRunTime(currentRun.createdAt);
  const extraCount = selectionCount - 1;
  const isRetry =
    selectionCount === 1 && selectedTransition?.status === "failed";

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelHeaderMain>
          <PanelTitle>Transition Settings</PanelTitle>
          {isPerTransition && fromName && toName && (
            <PanelSubtitle>
              {" "}
              &mdash; Editing: {fromName} &rarr; {toName}
              {currentRunTime && <SubtitleTime> {currentRunTime}</SubtitleTime>}
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
        {isPerTransition && modelOptions.length > 0 && (
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

        {isPerTransition && (
          <>
            <FieldGroup>
              <FieldLabel>Preset</FieldLabel>
              {/*
                Shows the preset whose values these settings still match, or
                Custom once they have been edited away from any of them. Picking
                one stamps its fields; there is nothing stored to pick back out.
              */}
              <Select
                value={currentPresetName}
                onChange={(e) => handleApplyPreset(e.target.value)}
              >
                <option value="">Custom</option>
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
                onChange={(e) => setValue("duration", Number(e.target.value))}
              >
                {allowedDurations.map((d) => (
                  <option key={d} value={d}>
                    {d}s
                  </option>
                ))}
              </Select>
            </FieldGroup>
          </>
        )}

        <CostEstimate amountUsd={totalCostUsd} breakdown={costBreakdown} />

        <GenerateButton
          $disabled={generateDisabled}
          disabled={generateDisabled}
          title={
            needsPrompt
              ? isPerTransition
                ? "Add a prompt or pick a preset to generate"
                : "A transition has no prompt — select it to give it one"
              : isPerTransition
                ? "Generate the selected transitions, edited or not"
                : "Generate every transition whose video is behind its settings"
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
          {isRetry ? "Retry" : "Generate"}
        </GenerateButton>
      </FieldRow>

      {needsPrompt && (
        <ValidationHint>
          {isPerTransition
            ? "Pick a preset or write a prompt to describe the motion."
            : "A transition has no prompt. Select it to give it one."}
        </ValidationHint>
      )}

      {!isPerTransition && (
        <ScopeHint>
          Nothing selected &mdash; Generate covers every transition whose video
          is behind its settings. Select one to edit it.
        </ScopeHint>
      )}

      <CreditLimitNotice
        overBudget={overBudget}
        canManageKey={canManageKey}
        resetIn={resetIn}
      />

      {/* Expand/collapse toggle */}
      {!isPerTransition ? null : !settingsExpanded ? (
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
                onChange={(e) => setValue("prompt", e.target.value)}
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
                onChange={(e) => setValue("negativePrompt", e.target.value)}
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
                    onChange={(e) => setValue("steps", Number(e.target.value))}
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
                  onChange={(guidance) => setValue("guidance", guidance)}
                />
              )}
            </ParamFields>
          </ExpandedSection>
        </>
      )}

      {/*
        With nothing inherited there is no "clear the override" to offer, so
        this writes the built-in default outright — still a way back to a known
        state, just an explicit one.
      */}
      {isPerTransition && (
        <ResetLink
          onClick={() => {
            const store = useFlowStore.getState();
            store.setTransitionSettings(store.selectedTransitionIndices, {
              ...DEFAULT_TRANSITION_SETTINGS,
            });
          }}
        >
          {selectionCount > 1
            ? `Reset ${selectionCount} transitions to default settings`
            : "Reset to default settings"}
        </ResetLink>
      )}

      {pendingEdit && (
        <ForceSettingsDialog
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
