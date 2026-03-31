import React, { useEffect, useMemo } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useBatchSubmit } from "../hooks/useBatchSubmit";
import { useUserPlaylists } from "../hooks/useUserPlaylists";
import { axiosClient } from "@/client/axios.client";
import type { VideoModel } from "@/types/studio.types";
import {
  clampDurationToAllowed,
  getAllowedDurationsForActions,
  hasActionLoras,
} from "../constants/duration-options";
import { PresignedImage } from "@/components/shared/presigned-image";
import {
  GenerateSection,
  SectionTitle,
  FormField,
  FieldLabel,
  StyledSelect,
  NavButton,
  BottomRow,
} from "./images-tab.styled";
import {
  CombinationGrid,
  GridTable,
  GridHeader,
  GridRowHeader,
  GridCell,
  CellThumb,
  CellCheckbox,
  SettingsGrid,
  PlaylistRow,
  DescriptionText,
  SubmittedLabel,
  ComboCountText,
  HintText,
} from "./generate-tab.styled";

const VIDEO_MODEL_LABELS: Record<VideoModel, string> = {
  "ltx-i2v": "LTX 2.3",
  "wan-i2v": "Wan I2V",
};

const STEPS_OPTIONS = [20, 25, 30, 40];
const GUIDANCE_OPTIONS = [3.0, 4.0, 5.0, 6.0, 7.0];

export const GenerateTab: React.FC = () => {
  const images = useStudioStore((s) => s.images);
  const actions = useStudioStore((s) => s.actions);
  const videoGenParams = useStudioStore((s) => s.videoGenParams);
  const setVideoGenParams = useStudioStore((s) => s.setVideoGenParams);
  const excludedCombos = useStudioStore((s) => s.excludedCombos);
  const toggleComboExcluded = useStudioStore((s) => s.toggleComboExcluded);
  const outputPlaylistId = useStudioStore((s) => s.outputPlaylistId);
  const setOutputPlaylistId = useStudioStore((s) => s.setOutputPlaylistId);
  const setActiveTab = useStudioStore((s) => s.setActiveTab);
  const jobs = useStudioStore((s) => s.jobs);

  const { submit, isSubmitting, getSelectedCombinations } = useBatchSubmit();
  const { playlists, addPlaylistToCache } = useUserPlaylists();

  const selectedImages = useMemo(
    () => images.filter((img) => img.selected && img.status === "processed"),
    [images],
  );
  const enabledActions = useMemo(
    () => actions.filter((a) => a.enabled && a.prompt.trim()),
    [actions],
  );

  const newCombos = useMemo(
    () => getSelectedCombinations(),
    [getSelectedCombinations],
  );
  const durationOptions = useMemo(
    () =>
      getAllowedDurationsForActions(
        newCombos.map(({ action }) => action),
        videoGenParams.model,
      ),
    [newCombos, videoGenParams.model],
  );

  const showLtxHint = useMemo(() => {
    if (videoGenParams.model !== "ltx-i2v") return false;
    const enabled = actions.filter((a) => a.enabled && a.prompt.trim());
    return enabled.length > 0 && enabled.every((a) => !hasActionLoras(a));
  }, [videoGenParams.model, actions]);

  useEffect(() => {
    const nextDuration = clampDurationToAllowed(
      videoGenParams.duration,
      durationOptions,
    );
    if (nextDuration !== videoGenParams.duration) {
      setVideoGenParams({ duration: nextDuration });
    }
  }, [durationOptions, videoGenParams.duration, setVideoGenParams]);

  const totalPossible = selectedImages.length * enabledActions.length;

  const handleCreatePlaylist = async () => {
    const now = new Date();
    const name = `Studio ${now.toISOString().slice(0, 16).replace("T", " ")}`;
    try {
      const { data } = await axiosClient.post("/v1/playlist", { name });
      const playlist = data.data.playlist;
      setOutputPlaylistId(playlist.uuid);
      addPlaylistToCache({ uuid: playlist.uuid, name: playlist.name });
    } catch (err) {
      console.error("Failed to create playlist:", err);
    }
  };

  return (
    <>
      <GenerateSection>
        <SectionTitle>Combination Preview</SectionTitle>
        <DescriptionText>
          Review all image &times; action combinations before generating.
          Uncheck any you want to skip.
        </DescriptionText>

        <CombinationGrid>
          <GridTable>
            <thead>
              <tr>
                <GridHeader />
                {enabledActions.map((action) => (
                  <GridHeader key={action.id} title={action.prompt}>
                    {action.prompt.slice(0, 20)}...
                  </GridHeader>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedImages.map((image) => (
                <tr key={image.uuid}>
                  <GridRowHeader>{image.name}</GridRowHeader>
                  {enabledActions.map((action) => {
                    const comboKey = `${image.uuid}:${action.id}`;
                    const excluded = excludedCombos.has(comboKey);
                    const existingJob = jobs.find(
                      (j) =>
                        j.imageId === image.uuid && j.actionId === action.id,
                    );

                    return (
                      <GridCell
                        key={comboKey}
                        $excluded={excluded}
                        onClick={() =>
                          !existingJob && toggleComboExcluded(comboKey)
                        }
                      >
                        {image.status === "processed" && (
                          <CellThumb
                            as={PresignedImage}
                            dreamUuid={image.uuid}
                            alt=""
                          />
                        )}
                        <br />
                        {existingJob ? (
                          <SubmittedLabel>submitted</SubmittedLabel>
                        ) : (
                          <CellCheckbox
                            checked={!excluded}
                            onChange={() => toggleComboExcluded(comboKey)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </GridCell>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </GridTable>
        </CombinationGrid>

        <ComboCountText>
          {newCombos.length} of {totalPossible} combinations selected
          {jobs.length > 0 && ` (${jobs.length} already submitted)`}
        </ComboCountText>
      </GenerateSection>

      <GenerateSection>
        <SectionTitle>Output Settings</SectionTitle>
        {showLtxHint && (
          <HintText>
            LTX works best with motion presets. Add a camera LoRA for better
            results.
          </HintText>
        )}
        <SettingsGrid>
          <FormField>
            <FieldLabel>Model:</FieldLabel>
            <StyledSelect
              value={videoGenParams.model}
              onChange={(e) =>
                setVideoGenParams({ model: e.target.value as VideoModel })
              }
            >
              {(Object.keys(VIDEO_MODEL_LABELS) as VideoModel[]).map((m) => (
                <option key={m} value={m}>
                  {VIDEO_MODEL_LABELS[m]}
                </option>
              ))}
            </StyledSelect>
          </FormField>
          <FormField>
            <FieldLabel>Duration:</FieldLabel>
            <StyledSelect
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
            </StyledSelect>
          </FormField>
          <FormField>
            <FieldLabel>Steps:</FieldLabel>
            <StyledSelect
              value={videoGenParams.numInferenceSteps}
              onChange={(e) =>
                setVideoGenParams({ numInferenceSteps: Number(e.target.value) })
              }
            >
              {STEPS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </StyledSelect>
          </FormField>
          <FormField>
            <FieldLabel>Guidance:</FieldLabel>
            <StyledSelect
              value={videoGenParams.guidance}
              onChange={(e) =>
                setVideoGenParams({ guidance: Number(e.target.value) })
              }
            >
              {GUIDANCE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </StyledSelect>
          </FormField>
        </SettingsGrid>

        <PlaylistRow>
          <FieldLabel>Output playlist:</FieldLabel>
          <StyledSelect
            value={outputPlaylistId || ""}
            onChange={(e) => setOutputPlaylistId(e.target.value || null)}
          >
            <option value="">Select playlist...</option>
            {playlists.map((p) => (
              <option key={p.uuid} value={p.uuid}>
                {p.name}
              </option>
            ))}
          </StyledSelect>
          <NavButton onClick={handleCreatePlaylist}>+ Create New</NavButton>
        </PlaylistRow>
      </GenerateSection>

      <BottomRow>
        <NavButton onClick={() => setActiveTab("actions")}>
          &larr; Back to Actions
        </NavButton>
        <NavButton
          onClick={submit}
          disabled={isSubmitting || newCombos.length === 0}
          style={{
            background: newCombos.length === 0 ? "#555" : undefined,
          }}
        >
          {isSubmitting
            ? "Submitting..."
            : `Generate ${newCombos.length} Videos \u2192`}
        </NavButton>
      </BottomRow>
    </>
  );
};
