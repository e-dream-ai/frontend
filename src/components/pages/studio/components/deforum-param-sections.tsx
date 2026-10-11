import type { CSSProperties } from "react";
import type { DeforumSettings } from "@/types/deforum.types";
import {
  DEFORUM_GLOBAL_SCHEDULES,
  DEFORUM_MOTION_ROWS,
  DEFORUM_SAMPLERS,
  DEFORUM_SCHEDULE_FIELDS,
  DEFORUM_SCHEDULERS,
  DEFORUM_SIZES,
  type DeforumScheduleField,
  randomDeforumSeed,
} from "../constants/deforum-options";
import { useNumberInput, wholeNumberRules } from "../hooks/useNumberInput";
import { useSeedInput } from "../hooks/useSeedInput";
import {
  FieldGroup,
  FieldLabel,
  FieldRow,
  PromptTextarea,
  Select,
} from "./transition-settings-panel.styled";
import {
  AdvancedDetails,
  AdvancedSummary,
  MotionRow,
  ParamGrid,
  ScheduleInput,
  Section,
  SectionHeader,
  SectionTitle,
  SegmentButton,
  SegmentedControl,
  SmallButton,
  TextInput,
} from "./deforum-app.styled";

interface SettingsSectionProps {
  settings: DeforumSettings;
  onEdit: (patch: Partial<DeforumSettings>) => void;
}

const SCHEDULE_FIELD_BY_KEY = Object.fromEntries(
  DEFORUM_SCHEDULE_FIELDS.map((f) => [f.field, f]),
) as Record<DeforumScheduleField, (typeof DEFORUM_SCHEDULE_FIELDS)[number]>;

interface NumberFieldProps {
  id: string;
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
  style?: CSSProperties;
}

export function NumberField({
  id,
  value,
  min,
  max,
  onCommit,
  style,
}: NumberFieldProps) {
  const input = useNumberInput(value, onCommit, wholeNumberRules(min, max));
  return (
    <TextInput
      id={id}
      maxLength={String(max).length}
      style={style}
      {...input}
    />
  );
}

function ScheduleField({
  field,
  settings,
  onEdit,
}: SettingsSectionProps & { field: DeforumScheduleField }) {
  const { param, label } = SCHEDULE_FIELD_BY_KEY[field];
  return (
    <FieldGroup>
      <FieldLabel htmlFor={`deforum-${param}`} title={param}>
        {label}
      </FieldLabel>
      <ScheduleInput
        id={`deforum-${param}`}
        spellCheck={false}
        value={settings[field]}
        onChange={(e) =>
          onEdit({ [field]: e.target.value } as Partial<DeforumSettings>)
        }
      />
    </FieldGroup>
  );
}

export function DeforumMotionSection({
  settings,
  onEdit,
}: SettingsSectionProps) {
  return (
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
              onClick={() => onEdit({ animationMode: mode })}
            >
              {mode}
            </SegmentButton>
          ))}
        </SegmentedControl>
      </SectionHeader>
      {DEFORUM_MOTION_ROWS[settings.animationMode].map((row) => (
        <MotionRow key={row.join()}>
          {row.map((field) => (
            <ScheduleField
              key={field}
              field={field}
              settings={settings}
              onEdit={onEdit}
            />
          ))}
        </MotionRow>
      ))}
    </Section>
  );
}

export function DeforumAdvancedSection({
  settings,
  onEdit,
}: SettingsSectionProps) {
  const seedInput = useSeedInput(settings.seed, (seed) => onEdit({ seed }));
  const sizeValue = `${settings.width}x${settings.height}`;

  return (
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
                onEdit({ width, height });
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
                style={{ width: "100%" }}
                {...seedInput}
              />
              <SmallButton
                title="New random seed"
                aria-label="New random seed"
                onClick={() => onEdit({ seed: randomDeforumSeed() })}
              >
                🎲
              </SmallButton>
            </FieldRow>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="deforum-steps">Steps</FieldLabel>
            <NumberField
              id="deforum-steps"
              value={settings.steps}
              min={1}
              max={100}
              onCommit={(steps) => onEdit({ steps })}
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="deforum-fps">FPS</FieldLabel>
            <NumberField
              id="deforum-fps"
              value={settings.fps}
              min={1}
              max={240}
              onCommit={(fps) => onEdit({ fps })}
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="deforum-sampler">Sampler</FieldLabel>
            <Select
              id="deforum-sampler"
              value={settings.sampler}
              onChange={(e) => onEdit({ sampler: e.target.value })}
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
              onChange={(e) => onEdit({ scheduler: e.target.value })}
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
                onEdit({
                  border: e.target.value as DeforumSettings["border"],
                })
              }
            >
              <option value="replicate">replicate</option>
              <option value="wrap">wrap</option>
            </Select>
          </FieldGroup>
          {DEFORUM_GLOBAL_SCHEDULES.map((field) => (
            <ScheduleField
              key={field}
              field={field}
              settings={settings}
              onEdit={onEdit}
            />
          ))}
        </ParamGrid>

        <FieldGroup style={{ marginTop: 12 }}>
          <FieldLabel htmlFor="deforum-negative">Negative prompt</FieldLabel>
          <PromptTextarea
            id="deforum-negative"
            style={{ minHeight: 60 }}
            value={settings.negativePrompt}
            onChange={(e) => onEdit({ negativePrompt: e.target.value })}
          />
        </FieldGroup>
      </AdvancedDetails>
    </Section>
  );
}
