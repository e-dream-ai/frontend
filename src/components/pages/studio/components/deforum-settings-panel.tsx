import { useCallback, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useShallow } from "zustand/react/shallow";
import { useDeforumStore } from "@/stores/deforum.store";
import { ROUTES } from "@/constants/routes.constants";
import type {
  DeforumPrompt,
  DeforumRenderKind,
  DeforumSettings,
} from "@/types/deforum.types";
import {
  DEFORUM_GLOBAL_SCHEDULES,
  DEFORUM_MOTION_ROWS,
  DEFORUM_SAMPLERS,
  DEFORUM_SCHEDULE_FIELDS,
  DEFORUM_SCHEDULERS,
  DEFORUM_SIZES,
  DEFORUM_TEST_FRAMES,
  type DeforumScheduleField,
  randomDeforumSeed,
} from "../constants/deforum-options";
import { resolveDeforumTargets } from "../utils/deforum-targets";
import { ForceSettingsDialog } from "./force-settings-dialog";
import {
  FieldGroup,
  FieldLabel,
  FieldRow,
  GenerateButton,
  OpenDreamLink,
  PanelContainer,
  PanelHeader,
  PanelSubtitle,
  PromptTextarea,
  ScopeHint,
  Select,
  ValidationHint,
} from "./transition-settings-panel.styled";
import {
  AdvancedDetails,
  AdvancedSummary,
  FrameInput,
  MotionRow,
  ParamGrid,
  PromptList,
  PromptRow,
  PromptText,
  ScheduleInput,
  Section,
  SectionHeader,
  SegmentButton,
  SegmentedControl,
  SecondaryButton,
  SectionTitle,
  SmallButton,
  TextInput,
} from "./deforum-app.styled";

interface DeforumSettingsPanelProps {
  onGenerate: (kind: DeforumRenderKind) => void;
  isGenerating: boolean;
}

/** Comparable form of one field, so a multi-selection can tell if it agrees. */
const fieldKey = (settings: DeforumSettings, field: keyof DeforumSettings) =>
  field === "prompts"
    ? JSON.stringify(settings.prompts.map(({ frame, text }) => [frame, text]))
    : JSON.stringify(settings[field]);

const SCHEDULE_FIELD_BY_KEY = Object.fromEntries(
  DEFORUM_SCHEDULE_FIELDS.map((f) => [f.field, f]),
) as Record<DeforumScheduleField, (typeof DEFORUM_SCHEDULE_FIELDS)[number]>;

const byFrame = (prompts: DeforumPrompt[]) =>
  [...prompts].sort((a, b) => a.frame - b.frame);

export function DeforumSettingsPanel({
  onGenerate,
  isGenerating,
}: DeforumSettingsPanelProps) {
  const { clips, selectedIds } = useDeforumStore(
    useShallow((s) => ({ clips: s.clips, selectedIds: s.selectedIds })),
  );
  const [pendingEdit, setPendingEdit] = useState<(() => void) | null>(null);

  const selected = useMemo(
    () => clips.filter((c) => selectedIds.includes(c.id)),
    [clips, selectedIds],
  );
  const primary = clips.find(
    (c) => c.id === selectedIds[selectedIds.length - 1],
  );
  const settings = primary?.settings;

  /**
   * Write a patch to every selected clip. When the selection disagrees about a
   * field being edited, confirm before forcing one value onto all of them —
   * the same rule the flow's transition panel follows.
   */
  const edit = useCallback(
    (fields: (keyof DeforumSettings)[], patch: Partial<DeforumSettings>) => {
      const { clips: current, selectedIds: ids } = useDeforumStore.getState();
      const run = () => useDeforumStore.getState().setClipSettings(ids, patch);
      const group = current.filter((c) => ids.includes(c.id));
      const clash = fields.some(
        (field) =>
          new Set(group.map((c) => fieldKey(c.settings, field))).size > 1,
      );
      if (clash) setPendingEdit(() => run);
      else run();
    },
    [],
  );

  const set = <K extends keyof DeforumSettings>(
    field: K,
    value: DeforumSettings[K],
  ) => edit([field], { [field]: value } as Partial<DeforumSettings>);

  const setPrompts = (prompts: DeforumPrompt[]) => set("prompts", prompts);

  const testTargets = resolveDeforumTargets(clips, selectedIds, "test");
  const finalTargets = resolveDeforumTargets(clips, selectedIds, "final");
  const hasSelection = selectedIds.length > 0;
  const needsPrompt = selected.some(
    (c) => !c.settings.prompts.some((p) => p.text.trim()),
  );

  const buttons = (
    <>
      <SecondaryButton
        $disabled={isGenerating || testTargets.length === 0}
        disabled={isGenerating || testTargets.length === 0}
        title={`Render ${DEFORUM_TEST_FRAMES} frames with every keyframe scaled to fit — a quick look at the whole arc`}
        onClick={() => onGenerate("test")}
      >
        Test ({DEFORUM_TEST_FRAMES} frames)
        {testTargets.length > 1 ? ` × ${testTargets.length}` : ""}
      </SecondaryButton>
      <GenerateButton
        $disabled={isGenerating || finalTargets.length === 0}
        disabled={isGenerating || finalTargets.length === 0}
        title="Full-length render. Finished renders go into the playlist."
        onClick={() => onGenerate("final")}
      >
        Render{finalTargets.length > 1 ? ` × ${finalTargets.length}` : ""}
      </GenerateButton>
      {primary?.final?.status === "failed" && selectedIds.length === 1 && (
        <OpenDreamLink
          to={`${ROUTES.VIEW_DREAM}/${primary.final.dreamUuid}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open failed render
        </OpenDreamLink>
      )}
    </>
  );

  const hints = (
    <>
      {needsPrompt && (
        <ValidationHint>
          Every animation needs at least one prompt to render.
        </ValidationHint>
      )}
      {!hasSelection && (
        <ScopeHint>
          Nothing selected &mdash; Test and Render cover every animation whose
          video is behind its settings. Select one to edit it, or several to
          change them together.
        </ScopeHint>
      )}
    </>
  );

  if (!settings || !primary) {
    return clips.length ? (
      <PanelContainer>
        <FieldRow>{buttons}</FieldRow>
        {hints}
      </PanelContainer>
    ) : null;
  }

  const lastFrame = settings.maxFrames - 1;
  const testScale = Math.min(1, DEFORUM_TEST_FRAMES / settings.maxFrames);
  const sizeValue = `${settings.width}x${settings.height}`;
  const extra = selectedIds.length - 1;

  const addPrompt = () => {
    const sorted = byFrame(settings.prompts);
    const last = sorted[sorted.length - 1];
    const step = Math.max(1, Math.round(settings.maxFrames / 5));
    // Start from the last prompt's text: the next keyframe is usually a
    // variation on it, not a blank slate.
    setPrompts([
      ...sorted,
      {
        id: uuidv4(),
        frame: Math.min((last?.frame ?? -1) + step, lastFrame),
        text: last?.text ?? "",
      },
    ]);
  };

  const renderSchedule = (field: DeforumScheduleField) => {
    const { param, label } = SCHEDULE_FIELD_BY_KEY[field];
    return (
      <FieldGroup key={field}>
        <FieldLabel htmlFor={`deforum-${param}`} title={param}>
          {label}
        </FieldLabel>
        <ScheduleInput
          id={`deforum-${param}`}
          spellCheck={false}
          value={settings[field]}
          onChange={(e) => set(field, e.target.value)}
        />
      </FieldGroup>
    );
  };

  return (
    <PanelContainer>
      <PanelHeader style={{ minHeight: 0 }}>
        <FieldRow style={{ alignItems: "center", gap: 8 }}>
          <FieldLabel htmlFor="deforum-frames">Frames</FieldLabel>
          <TextInput
            id="deforum-frames"
            type="text"
            inputMode="numeric"
            maxLength={5}
            // Five digits is plenty: room for up to 99999 frames.
            style={{ width: "calc(5ch + 24px)" }}
            value={settings.maxFrames}
            onChange={(e) =>
              set(
                "maxFrames",
                Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1),
              )
            }
          />
          {buttons}
        </FieldRow>
        <PanelSubtitle>
          Editing: {primary.name}
          {extra > 0 && ` and ${extra} more`}
        </PanelSubtitle>
      </PanelHeader>

      {hints}

      <Section>
        <SectionHeader>
          <SectionTitle>Prompts</SectionTitle>
        </SectionHeader>
        <PromptList>
          {settings.prompts.map((prompt, i) => {
            // The first prompt is where the animation starts: always frame 0.
            const isFirst = i === 0;
            const outOfRange = prompt.frame < 0 || prompt.frame > lastFrame;
            const duplicate = settings.prompts.some(
              (p, j) => j !== i && p.frame === prompt.frame,
            );
            return (
              <PromptRow key={prompt.id}>
                <SmallButton
                  aria-label="Remove prompt"
                  disabled={isFirst}
                  title={
                    isFirst ? "The first prompt can't be removed" : undefined
                  }
                  onClick={() =>
                    setPrompts(
                      settings.prompts.filter((p) => p.id !== prompt.id),
                    )
                  }
                >
                  ✕
                </SmallButton>
                <FieldGroup>
                  <FrameInput
                    type="text"
                    inputMode="numeric"
                    aria-label="Frame"
                    readOnly={isFirst}
                    $invalid={!isFirst && (outOfRange || duplicate)}
                    title={
                      isFirst
                        ? "The first prompt always starts at frame 0"
                        : outOfRange
                          ? `Past the last frame (${lastFrame})`
                          : duplicate
                            ? "Another prompt starts on this frame"
                            : `Test frame ≈ ${Math.round(
                                prompt.frame * testScale,
                              )}`
                    }
                    value={isFirst ? 0 : prompt.frame}
                    onChange={(e) =>
                      setPrompts(
                        settings.prompts.map((p) =>
                          p.id === prompt.id
                            ? {
                                ...p,
                                frame:
                                  Number(e.target.value.replace(/\D/g, "")) ||
                                  0,
                              }
                            : p,
                        ),
                      )
                    }
                    onBlur={() => {
                      const sorted = byFrame(settings.prompts);
                      if (sorted.some((p, j) => p !== settings.prompts[j])) {
                        setPrompts(sorted);
                      }
                    }}
                  />
                </FieldGroup>
                <PromptText
                  aria-label={`Prompt at frame ${prompt.frame}`}
                  placeholder="What the animation becomes from this frame on…"
                  value={prompt.text}
                  onChange={(e) =>
                    setPrompts(
                      settings.prompts.map((p) =>
                        p.id === prompt.id ? { ...p, text: e.target.value } : p,
                      ),
                    )
                  }
                />
              </PromptRow>
            );
          })}
        </PromptList>
        <FieldRow style={{ marginTop: 8 }}>
          <SmallButton onClick={addPrompt}>+ Add prompt</SmallButton>
        </FieldRow>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>Motion</SectionTitle>
          <SegmentedControl role="group" aria-label="Animation mode">
            {(["3D", "2D"] as const).map((mode) => (
              <SegmentButton
                key={mode}
                type="button"
                $active={settings.animationMode === mode}
                aria-pressed={settings.animationMode === mode}
                title={
                  mode === "3D"
                    ? "Camera moves through the scene: translation and rotation"
                    : "Canvas warps flat: zoom, angle and translation"
                }
                onClick={() => set("animationMode", mode)}
              >
                {mode}
              </SegmentButton>
            ))}
          </SegmentedControl>
        </SectionHeader>
        {DEFORUM_MOTION_ROWS[settings.animationMode].map((row) => (
          <MotionRow key={row.join()}>{row.map(renderSchedule)}</MotionRow>
        ))}
      </Section>

      <Section>
        <AdvancedDetails>
          <AdvancedSummary>Advanced parameters</AdvancedSummary>
          <ParamGrid>
            <FieldGroup>
              <FieldLabel htmlFor="deforum-size">Size</FieldLabel>
              <Select
                id="deforum-size"
                value={sizeValue}
                onChange={(e) => {
                  const [width, height] = e.target.value.split("x").map(Number);
                  edit(["width", "height"], { width, height });
                }}
              >
                {!DEFORUM_SIZES.some(
                  (s) => `${s.width}x${s.height}` === sizeValue,
                ) && (
                  <option value={sizeValue}>
                    {settings.width}×{settings.height}
                  </option>
                )}
                {DEFORUM_SIZES.map((s) => (
                  <option key={s.label} value={`${s.width}x${s.height}`}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="deforum-seed">Seed (-1 random)</FieldLabel>
              <FieldRow style={{ gap: 6, flexWrap: "nowrap" }}>
                <TextInput
                  id="deforum-seed"
                  type="text"
                  inputMode="numeric"
                  value={settings.seed}
                  // -1 is the only negative seed: a fresh one every render.
                  onChange={(e) =>
                    set(
                      "seed",
                      e.target.value.trim().startsWith("-")
                        ? -1
                        : Number(e.target.value.replace(/\D/g, "")) || 0,
                    )
                  }
                  style={{ width: "100%" }}
                />
                <SmallButton
                  title="New random seed"
                  onClick={() => set("seed", randomDeforumSeed())}
                >
                  🎲
                </SmallButton>
              </FieldRow>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="deforum-steps">Steps</FieldLabel>
              <TextInput
                id="deforum-steps"
                type="text"
                inputMode="numeric"
                maxLength={3}
                value={settings.steps}
                onChange={(e) =>
                  set(
                    "steps",
                    Math.min(
                      100,
                      Math.max(
                        1,
                        Number(e.target.value.replace(/\D/g, "")) || 1,
                      ),
                    ),
                  )
                }
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="deforum-fps">FPS</FieldLabel>
              <TextInput
                id="deforum-fps"
                type="text"
                inputMode="numeric"
                maxLength={3}
                value={settings.fps}
                onChange={(e) =>
                  set(
                    "fps",
                    Math.min(
                      240,
                      Math.max(
                        1,
                        Number(e.target.value.replace(/\D/g, "")) || 1,
                      ),
                    ),
                  )
                }
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="deforum-sampler">Sampler</FieldLabel>
              <Select
                id="deforum-sampler"
                value={settings.sampler}
                onChange={(e) => set("sampler", e.target.value)}
              >
                {[...new Set([settings.sampler, ...DEFORUM_SAMPLERS])].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ),
                )}
              </Select>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="deforum-scheduler">Scheduler</FieldLabel>
              <Select
                id="deforum-scheduler"
                value={settings.scheduler}
                onChange={(e) => set("scheduler", e.target.value)}
              >
                {[...new Set([settings.scheduler, ...DEFORUM_SCHEDULERS])].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ),
                )}
              </Select>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="deforum-border">Border</FieldLabel>
              <Select
                id="deforum-border"
                value={settings.border}
                onChange={(e) =>
                  set("border", e.target.value as DeforumSettings["border"])
                }
              >
                <option value="replicate">replicate</option>
                <option value="wrap">wrap</option>
              </Select>
            </FieldGroup>
            {DEFORUM_GLOBAL_SCHEDULES.map(renderSchedule)}
          </ParamGrid>

          <FieldGroup style={{ marginTop: 12 }}>
            <FieldLabel htmlFor="deforum-negative">Negative prompt</FieldLabel>
            <PromptTextarea
              id="deforum-negative"
              style={{ minHeight: 60 }}
              value={settings.negativePrompt}
              onChange={(e) => set("negativePrompt", e.target.value)}
            />
          </FieldGroup>
        </AdvancedDetails>
      </Section>

      {pendingEdit && (
        <ForceSettingsDialog
          title="Give these animations the same value?"
          body="The selected animations don't agree on this setting. OK sets it on all of them; Cancel leaves them as they are."
          onConfirm={() => {
            pendingEdit();
            setPendingEdit(null);
          }}
          onCancel={() => setPendingEdit(null)}
        />
      )}
    </PanelContainer>
  );
}
