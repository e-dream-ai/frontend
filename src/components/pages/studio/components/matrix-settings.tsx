import { useStudioStore } from "@/stores/studio.store";
import { useModelConstraints } from "@/api/model/query/useModelConstraints";
import type { VideoModel } from "@/types/studio.types";
import {
  GUIDANCE_PARAM,
  carryGuidance,
  guidanceForModel,
  resolveGuidanceConstraint,
} from "../constants/guidance-options";
import { SEED_HINT } from "../constants/seed-options";
import { VIDEO_MODEL_LABELS } from "../constants/video-model-labels";
import { useSeedInput } from "../hooks/useSeedInput";
import { GuidanceField } from "./guidance-field";
import { SectionTitle } from "./images-tab.styled";
import {
  SeedInput,
  SettingField,
  SettingFieldWide,
  SettingLabel,
  SettingSelect,
  SettingsGrid,
  SettingsSection,
} from "./generate-tab.styled";

const VIDEO_MODELS: VideoModel[] = [
  "ltx-i2v",
  "wan-i2v",
  "kling-25-i2v",
  "kling-i2v",
];

const STEPS_OPTIONS = [20, 25, 30, 40];

interface Props {
  durationOptions: readonly number[];
  hidden: boolean;
}

export function MatrixSettings({ durationOptions, hidden }: Props) {
  const videoGenParams = useStudioStore((s) => s.videoGenParams);
  const setVideoGenParams = useStudioStore((s) => s.setVideoGenParams);
  const modelConstraints = useModelConstraints({ mediaType: "video" });

  const constraints = modelConstraints.get(videoGenParams.model);
  const supportsSteps = constraints?.supportsSteps ?? true;
  const guidanceConstraint = resolveGuidanceConstraint(
    videoGenParams.model,
    constraints,
  );
  const guidanceParam = GUIDANCE_PARAM[videoGenParams.model];
  const seedInput = useSeedInput(videoGenParams.seed, (seed) =>
    setVideoGenParams({ seed }),
  );

  const handleModelChange = (model: VideoModel) => {
    setVideoGenParams({
      model,
      guidance: carryGuidance(
        videoGenParams.guidance,
        resolveGuidanceConstraint(model, modelConstraints.get(model)),
      ),
    });
  };

  return (
    <SettingsSection $hidden={hidden}>
      <SectionTitle>Settings</SectionTitle>
      <SettingsGrid>
        <SettingFieldWide>
          <SettingLabel htmlFor="batch-model">Model</SettingLabel>
          <SettingSelect
            id="batch-model"
            value={videoGenParams.model}
            onChange={(e) => handleModelChange(e.target.value as VideoModel)}
          >
            {VIDEO_MODELS.map((m) => (
              <option key={m} value={m}>
                {VIDEO_MODEL_LABELS[m]}
              </option>
            ))}
          </SettingSelect>
        </SettingFieldWide>
        <SettingField>
          <SettingLabel htmlFor="batch-duration">Duration</SettingLabel>
          <SettingSelect
            id="batch-duration"
            value={videoGenParams.duration}
            onChange={(e) =>
              setVideoGenParams({ duration: Number(e.target.value) })
            }
          >
            {durationOptions.map((d) => (
              <option key={d} value={d}>
                {d} seconds
              </option>
            ))}
          </SettingSelect>
        </SettingField>
        {supportsSteps && (
          <SettingField>
            <SettingLabel htmlFor="batch-steps">Steps</SettingLabel>
            <SettingSelect
              id="batch-steps"
              value={videoGenParams.numInferenceSteps}
              onChange={(e) =>
                setVideoGenParams({
                  numInferenceSteps: Number(e.target.value),
                })
              }
            >
              {STEPS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SettingSelect>
          </SettingField>
        )}
        {videoGenParams.model === "ltx-i2v" && (
          <SettingField>
            <SettingLabel htmlFor="batch-seed" title={SEED_HINT}>
              Seed
            </SettingLabel>
            <SeedInput id="batch-seed" title={SEED_HINT} {...seedInput} />
          </SettingField>
        )}
        {guidanceConstraint && guidanceParam && (
          <SettingFieldWide>
            <GuidanceField
              param={guidanceParam}
              constraint={guidanceConstraint}
              value={guidanceForModel(
                videoGenParams.guidance,
                guidanceConstraint,
              )}
              onChange={(guidance) => setVideoGenParams({ guidance })}
            />
          </SettingFieldWide>
        )}
      </SettingsGrid>
    </SettingsSection>
  );
}
