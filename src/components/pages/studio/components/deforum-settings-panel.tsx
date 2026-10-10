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
  DEFORUM_FRAME_PRESETS,
  DEFORUM_SAMPLERS,
  DEFORUM_SCHEDULE_FIELDS,
  DEFORUM_SCHEDULERS,
  DEFORUM_SIZES,
  DEFORUM_TEST_FRAMES,
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
  PanelHeaderMain,
  PanelSubtitle,
  PanelTitle,
  PromptTextarea,
  ScopeHint,
  Select,
  ValidationHint,
} from "./transition-settings-panel.styled";
import {
  FrameHint,
  FrameInput,
  ParamGrid,
  PromptList,
  PromptRow,
  PromptText,
  ScheduleGrid,
  ScheduleInput,
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

  const actions = (
    <>
      <FieldRow>
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
      </FieldRow>
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
    return clips.length ? <PanelContainer>{actions}</PanelContainer> : null;
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

  return (
    <PanelContainer>
      <PanelHeader style={{ minHeight: 0 }}>
        <PanelHeaderMain>
          <PanelTitle>Animation Settings</PanelTitle>
          <PanelSubtitle>
            {" "}
            &mdash; Editing: {primary.name}
            {extra > 0 && ` and ${extra} more`}
          </PanelSubtitle>
        </PanelHeaderMain>
      </PanelHeader>

      {actions}

      {selectedIds.length === 1 && (
        <FieldRow style={{ marginTop: 16 }}>
          <FieldGroup>
            <FieldLabel htmlFor="deforum-name">Name</FieldLabel>
            <TextInput
              id="deforum-name"
              value={primary.name}
              onChange={(e) =>
                useDeforumStore
                  .getState()
                  .renameClip(primary.id, e.target.value)
              }
            />
          </FieldGroup>
        </FieldRow>
      )}

      <SectionTitle>Prompts</SectionTitle>
      <PromptList>
        {settings.prompts.map((prompt, i) => {
          const outOfRange = prompt.frame < 0 || prompt.frame > lastFrame;
          const duplicate = settings.prompts.some(
            (p, j) => j !== i && p.frame === prompt.frame,
          );
          return (
            <PromptRow key={prompt.id}>
              <FieldGroup>
                <FrameInput
                  type="number"
                  min={0}
                  max={lastFrame}
                  aria-label="Frame"
                  $invalid={outOfRange || duplicate}
                  title={
                    outOfRange
                      ? `Past the last frame (${lastFrame})`
                      : duplicate
                        ? "Another prompt starts on this frame"
                        : `Test frame ≈ ${Math.round(prompt.frame * testScale)}`
                  }
                  value={prompt.frame}
                  onChange={(e) =>
                    setPrompts(
                      settings.prompts.map((p) =>
                        p.id === prompt.id
                          ? {
                              ...p,
                              frame: Math.max(0, Number(e.target.value) || 0),
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
              <SmallButton
                aria-label="Remove prompt"
                disabled={settings.prompts.length === 1}
                onClick={() =>
                  setPrompts(settings.prompts.filter((p) => p.id !== prompt.id))
                }
              >
                ✕
              </SmallButton>
            </PromptRow>
          );
        })}
      </PromptList>
      <FieldRow style={{ marginTop: 8 }}>
        <SmallButton onClick={addPrompt}>+ Add prompt</SmallButton>
      </FieldRow>

      <SectionTitle>Global parameters</SectionTitle>
      <ParamGrid>
        <FieldGroup>
          <FieldLabel htmlFor="deforum-frames">Frames</FieldLabel>
          <TextInput
            id="deforum-frames"
            type="number"
            min={DEFORUM_TEST_FRAMES}
            max={10000}
            list="deforum-frame-presets"
            value={settings.maxFrames}
            onChange={(e) =>
              set(
                "maxFrames",
                Math.max(1, Math.round(Number(e.target.value) || 1)),
              )
            }
          />
          <datalist id="deforum-frame-presets">
            {DEFORUM_FRAME_PRESETS.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          <FrameHint>
            Test: {Math.min(DEFORUM_TEST_FRAMES, settings.maxFrames)} frames
            {testScale < 1 && ` (keyframes ×${testScale.toFixed(3)})`}
          </FrameHint>
        </FieldGroup>

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
              type="number"
              min={-1}
              value={settings.seed}
              onChange={(e) => set("seed", Math.round(Number(e.target.value)))}
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
            type="number"
            min={1}
            max={100}
            value={settings.steps}
            onChange={(e) => set("steps", Number(e.target.value))}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="deforum-sampler">Sampler</FieldLabel>
          <Select
            id="deforum-sampler"
            value={settings.sampler}
            onChange={(e) => set("sampler", e.target.value)}
          >
            {[...new Set([settings.sampler, ...DEFORUM_SAMPLERS])].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
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
          <FieldLabel htmlFor="deforum-mode">Animation mode</FieldLabel>
          <Select
            id="deforum-mode"
            value={settings.animationMode}
            onChange={(e) =>
              set(
                "animationMode",
                e.target.value as DeforumSettings["animationMode"],
              )
            }
          >
            <option value="3D">3D</option>
            <option value="2D">2D</option>
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

      <SectionTitle>Motion schedules</SectionTitle>
      <FrameHint>
        <code>frame: (value)</code> pairs, e.g.{" "}
        <code>0: (1.0), 120: (1.05)</code>. Frame keys scale with the test;
        values and expressions in <code>t</code> do not.
      </FrameHint>
      <ScheduleGrid style={{ marginTop: 10 }}>
        {DEFORUM_SCHEDULE_FIELDS.map(({ field, param, label }) => (
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
        ))}
      </ScheduleGrid>

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
