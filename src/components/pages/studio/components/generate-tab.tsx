import React, { useEffect, useMemo, useState } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useBatchSubmit } from "../hooks/useBatchSubmit";
import { axiosClient } from "@/client/axios.client";
import useAuth from "@/hooks/useAuth";
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
} from "./generate-tab.styled";

const DURATION_OPTIONS = [3, 5, 7, 10];
const STEPS_OPTIONS = [20, 25, 30, 40];
const GUIDANCE_OPTIONS = [3.0, 4.0, 5.0, 6.0, 7.0];

export const GenerateTab: React.FC = () => {
  const images = useStudioStore((s) => s.images);
  const actions = useStudioStore((s) => s.actions);
  const wanParams = useStudioStore((s) => s.wanParams);
  const setWanParams = useStudioStore((s) => s.setWanParams);
  const excludedCombos = useStudioStore((s) => s.excludedCombos);
  const toggleComboExcluded = useStudioStore((s) => s.toggleComboExcluded);
  const outputPlaylistId = useStudioStore((s) => s.outputPlaylistId);
  const setOutputPlaylistId = useStudioStore((s) => s.setOutputPlaylistId);
  const setActiveTab = useStudioStore((s) => s.setActiveTab);
  const jobs = useStudioStore((s) => s.jobs);
  const { user } = useAuth();

  const { submit, isSubmitting, getSelectedCombinations } = useBatchSubmit();

  const [playlists, setPlaylists] = useState<
    Array<{ uuid: string; name: string }>
  >([]);

  const selectedImages = images.filter(
    (img) => img.selected && img.status === "processed",
  );
  const enabledActions = actions.filter((a) => a.enabled && a.prompt.trim());

  const newCombos = useMemo(
    () => getSelectedCombinations(),
    [getSelectedCombinations],
  );
  const totalPossible = selectedImages.length * enabledActions.length;
  const wanJobCount = jobs.filter((j) => j.jobType !== "uprez").length;

  useEffect(() => {
    if (!user?.uuid) return;
    axiosClient
      .get(`/v1/playlist?userUUID=${user.uuid}&take=200&skip=0`)
      .then(({ data }) => {
        setPlaylists(
          data.data.playlists.map((p: { uuid: string; name: string }) => ({
            uuid: p.uuid,
            name: p.name,
          })),
        );
      })
      .catch(() => {});
  }, [user?.uuid]);

  const handleCreatePlaylist = async () => {
    const now = new Date();
    const name = `Studio ${now.toISOString().slice(0, 16).replace("T", " ")}`;
    try {
      const { data } = await axiosClient.post("/v1/playlist", { name });
      const playlist = data.data.playlist;
      setOutputPlaylistId(playlist.uuid);
      setPlaylists((prev) => [
        { uuid: playlist.uuid, name: playlist.name },
        ...prev,
      ]);
    } catch (err) {
      console.error("Failed to create playlist:", err);
    }
  };

  return (
    <>
      <GenerateSection>
        <SectionTitle>Combination Preview</SectionTitle>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "#888",
            marginBottom: "1rem",
          }}
        >
          Review all image &times; action combinations before generating.
          Uncheck any you want to skip.
        </p>

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
                        {image.url && <CellThumb src={image.url} alt="" />}
                        <br />
                        {existingJob ? (
                          <span
                            style={{ fontSize: "0.6875rem", color: "#6c6" }}
                          >
                            submitted
                          </span>
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

        <p
          style={{
            fontSize: "0.8125rem",
            color: "#888",
            textAlign: "center",
          }}
        >
          {newCombos.length} of {totalPossible} combinations selected
          {wanJobCount > 0 && ` (${wanJobCount} already submitted)`}
        </p>
      </GenerateSection>

      <GenerateSection>
        <SectionTitle>Output Settings</SectionTitle>
        <SettingsGrid>
          <FormField>
            <FieldLabel>Duration:</FieldLabel>
            <StyledSelect
              value={wanParams.duration}
              onChange={(e) =>
                setWanParams({ duration: Number(e.target.value) })
              }
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d} seconds
                </option>
              ))}
            </StyledSelect>
          </FormField>
          <FormField>
            <FieldLabel>Steps:</FieldLabel>
            <StyledSelect
              value={wanParams.numInferenceSteps}
              onChange={(e) =>
                setWanParams({ numInferenceSteps: Number(e.target.value) })
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
              value={wanParams.guidance}
              onChange={(e) =>
                setWanParams({ guidance: Number(e.target.value) })
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
