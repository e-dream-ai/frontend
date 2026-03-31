import React, { useCallback, useMemo, useState } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useCreateDreamFromPrompt } from "@/api/dream/mutation/useCreateDreamFromPrompt";
import { axiosClient } from "@/client/axios.client";
import { createComboKey } from "@/types/studio.types";
import type { StudioJob, UprezModel } from "@/types/studio.types";
import { useUserPlaylists } from "../hooks/useUserPlaylists";
import {
  clampDurationToAllowed,
  getAllowedDurationsForActions,
  hasActionLoras,
} from "../constants/duration-options";
import { PresignedImage } from "@/components/shared/presigned-image";
import {
  GenerateSection,
  SectionTitle,
  StyledSelect,
} from "./images-tab.styled";
import { GridTable, GridHeader, GridRowHeader } from "./generate-tab.styled";
import {
  ProgressBar,
  ProgressInfo,
  ProgressTrack,
  ProgressFill,
  ResultCell,
  ResultThumb,
  ResultThumbImg,
  ResultCellStatus,
  UprezStarBadge,
  ActionBar,
  ActionButton,
  ScrollableGrid,
  TimeEstimate,
} from "./results-tab.styled";

const BATCH_SIZE = 5;

const UPREZ_MODEL_LABELS: Record<UprezModel, string> = {
  uprez: "Current Uprez",
  "nvidia-uprez": "Nvidia Super Resolution",
};

export const ResultsTab: React.FC = () => {
  const images = useStudioStore((s) => s.images);
  const actions = useStudioStore((s) => s.actions);
  const jobs = useStudioStore((s) => s.jobs);
  const toggleJobUprez = useStudioStore((s) => s.toggleJobUprez);
  const selectAllJobsForUprez = useStudioStore((s) => s.selectAllJobsForUprez);
  const deselectAllJobsForUprez = useStudioStore(
    (s) => s.deselectAllJobsForUprez,
  );
  const addJob = useStudioStore((s) => s.addJob);
  const outputPlaylistId = useStudioStore((s) => s.outputPlaylistId);
  const uprezPlaylistId = useStudioStore((s) => s.uprezPlaylistId);
  const setUprezPlaylistId = useStudioStore((s) => s.setUprezPlaylistId);
  const updateJob = useStudioStore((s) => s.updateJob);
  const setActiveTab = useStudioStore((s) => s.setActiveTab);
  const createDream = useCreateDreamFromPrompt();
  const { addPlaylistToCache } = useUserPlaylists();

  const videoGenParams = useStudioStore((s) => s.videoGenParams);
  const uprezModel = useStudioStore((s) => s.uprezModel);
  const setUprezModel = useStudioStore((s) => s.setUprezModel);
  const removeJob = useStudioStore((s) => s.removeJob);

  const [isUprezzing, setIsUprezzing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Derive grid dimensions from jobs (not from selected/enabled filters)
  const gridImageIds = useMemo(() => {
    const ids = new Set<string>();
    jobs
      .filter((j) => j.jobType !== "uprez" && j.jobType !== "nvidia-uprez")
      .forEach((j) => ids.add(j.imageId));
    return [...ids];
  }, [jobs]);

  const gridActionIds = useMemo(() => {
    const ids = new Set<string>();
    jobs
      .filter((j) => j.jobType !== "uprez" && j.jobType !== "nvidia-uprez")
      .forEach((j) => ids.add(j.actionId));
    return [...ids];
  }, [jobs]);

  const gridImages = useMemo(
    () =>
      gridImageIds
        .map((id) => images.find((img) => img.uuid === id))
        .filter(Boolean),
    [gridImageIds, images],
  );

  const gridActions = useMemo(
    () =>
      gridActionIds
        .map((id) => actions.find((a) => a.id === id))
        .filter(Boolean),
    [gridActionIds, actions],
  );

  const wanJobs = useMemo(
    () =>
      jobs.filter((j) => j.jobType !== "uprez" && j.jobType !== "nvidia-uprez"),
    [jobs],
  );

  const { completedCount, failedCount } = useMemo(() => {
    let completed = 0;
    let failed = 0;
    for (const j of wanJobs) {
      if (j.status === "processed") completed++;
      else if (j.status === "failed") failed++;
    }
    return { completedCount: completed, failedCount: failed };
  }, [wanJobs]);

  const totalCount = wanJobs.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const uprezCount = useMemo(
    () => jobs.filter((j) => j.selectedForUprez && !j.uprezed).length,
    [jobs],
  );

  const uprezableWanJobs = useMemo(
    () => wanJobs.filter((j) => j.status === "processed" && !j.uprezed),
    [wanJobs],
  );
  const allUprezableSelectedForUprez =
    uprezableWanJobs.length > 0 &&
    uprezableWanJobs.every((j) => j.selectedForUprez);

  const timeEstimate = useMemo(() => {
    const done = wanJobs.filter((j) => j.startedAt && j.completedAt);
    if (done.length === 0) return null;
    const avgMs =
      done.reduce((sum, j) => sum + (j.completedAt! - j.startedAt!), 0) /
      done.length;
    const remaining = totalCount - completedCount - failedCount;
    if (remaining <= 0) return null;
    const estimateMs = avgMs * remaining;
    const minutes = Math.ceil(estimateMs / 60_000);
    return minutes <= 1 ? "~1 min remaining" : `~${minutes} min remaining`;
  }, [wanJobs, totalCount, completedCount, failedCount]);

  const jobMap = useMemo(() => {
    const map = new Map<string, StudioJob>();
    for (const j of jobs) {
      if (j.jobType !== "uprez" && j.jobType !== "nvidia-uprez") {
        map.set(`${j.imageId}:${j.actionId}`, j);
      }
    }
    return map;
  }, [jobs]);

  const handleUprezSelected = useCallback(async () => {
    const toUprez = jobs.filter(
      (j) =>
        j.selectedForUprez &&
        j.status === "processed" &&
        j.jobType !== "uprez" &&
        j.jobType !== "nvidia-uprez" &&
        !j.uprezed,
    );
    if (toUprez.length === 0) return;

    setIsUprezzing(true);
    try {
      // Create a dedicated uprez playlist if we don't have one yet
      let playlistId = uprezPlaylistId;
      if (!playlistId) {
        const now = new Date();
        const name = `Studio Uprez ${now
          .toISOString()
          .slice(0, 16)
          .replace("T", " ")}`;
        const { data } = await axiosClient.post("/v1/playlist", { name });
        const playlist = data.data.playlist;
        playlistId = playlist.uuid;
        setUprezPlaylistId(playlistId);
        addPlaylistToCache({ uuid: playlist.uuid, name: playlist.name });
      }

      for (let i = 0; i < toUprez.length; i += BATCH_SIZE) {
        const batch = toUprez.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
          batch.map(async (job) => {
            const algoParams =
              uprezModel === "nvidia-uprez"
                ? {
                    infinidream_algorithm: "nvidia-uprez" as const,
                    video_uuid: job.dreamUuid,
                    upscale_factor: 2,
                    quality: "HIGH" as const,
                  }
                : {
                    infinidream_algorithm: "uprez" as const,
                    video_uuid: job.dreamUuid,
                    upscale_factor: 2,
                    interpolation_factor: 2,
                  };

            const response = await createDream.mutateAsync({
              name: `Uprez - ${job.dreamUuid.slice(0, 8)}`,
              prompt: JSON.stringify(algoParams),
              description: `Uprez of ${job.dreamUuid}`,
            });

            const dream = response.data?.dream;
            if (!dream) return;

            addJob({
              imageId: job.imageId,
              actionId: `uprez-${job.actionId}`,
              dreamUuid: dream.uuid,
              jobType: uprezModel,
              status: (dream.status as StudioJob["status"]) || "queue",
              selectedForUprez: false,
            });

            // Add to the dedicated uprez playlist
            if (playlistId) {
              await axiosClient.put(`/v1/playlist/${playlistId}/add-item`, {
                type: "dream",
                uuid: dream.uuid,
              });
            }

            // Mark source job as uprezed and deselect it
            updateJob(job.dreamUuid, {
              selectedForUprez: false,
              uprezed: true,
            });
          }),
        );

        for (const result of results) {
          if (result.status === "rejected") {
            console.error("Failed to create uprez job:", result.reason);
          }
        }
      }
    } finally {
      setIsUprezzing(false);
    }
  }, [
    jobs,
    createDream,
    addJob,
    updateJob,
    uprezModel,
    uprezPlaylistId,
    setUprezPlaylistId,
    addPlaylistToCache,
  ]);

  const handleRetryFailed = useCallback(async () => {
    // Only retry video generation jobs (uprez retries not yet supported)
    const failedJobs = jobs.filter(
      (j) =>
        j.status === "failed" &&
        j.jobType !== "uprez" &&
        j.jobType !== "nvidia-uprez",
    );
    if (failedJobs.length === 0) return;

    const failedActionIds = new Set(failedJobs.map((j) => j.actionId));
    const allowedDurations = getAllowedDurationsForActions(
      actions.filter((action) => failedActionIds.has(action.id)),
      videoGenParams.model,
    );
    const duration = clampDurationToAllowed(
      videoGenParams.duration,
      allowedDurations,
    );

    setIsRetrying(true);
    try {
      for (let i = 0; i < failedJobs.length; i += BATCH_SIZE) {
        const batch = failedJobs.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
          batch.map(async (job) => {
            const image = images.find((img) => img.uuid === job.imageId);
            const action = actions.find((a) => a.id === job.actionId);
            if (!image || !action) return;

            const hasLoras = hasActionLoras(action);
            const batchIdentifier = createComboKey(image.uuid, action.prompt);

            let algoParams: Record<string, unknown>;
            if (videoGenParams.model === "ltx-i2v") {
              algoParams = {
                infinidream_algorithm: "ltx-i2v" as const,
                prompt: action.prompt,
                image: image.uuid,
                duration,
                num_inference_steps: videoGenParams.numInferenceSteps,
                guidance: videoGenParams.guidance,
              };
            } else if (hasLoras) {
              algoParams = {
                infinidream_algorithm: "wan-i2v-lora" as const,
                prompt: action.prompt,
                image: image.uuid,
                duration,
                num_inference_steps: videoGenParams.numInferenceSteps,
                guidance: videoGenParams.guidance,
                seed: -1,
                high_noise_loras: action.highNoiseLoras ?? [],
                low_noise_loras: action.lowNoiseLoras ?? [],
              };
            } else {
              algoParams = {
                infinidream_algorithm: "wan-i2v" as const,
                prompt: action.prompt,
                image: image.uuid,
                size: image.size || "1280*720",
                duration,
                num_inference_steps: videoGenParams.numInferenceSteps,
                guidance: videoGenParams.guidance,
              };
            }

            const response = await createDream.mutateAsync({
              name: `${image.name} - ${action.prompt.slice(0, 40)}`,
              prompt: JSON.stringify(algoParams),
              description: `Studio batch retry. BATCH_IDENTIFIER:${batchIdentifier}`,
            });

            const dream = response.data?.dream;
            if (!dream) return;

            removeJob(job.dreamUuid);
            addJob({
              imageId: job.imageId,
              actionId: job.actionId,
              dreamUuid: dream.uuid,
              jobType: videoGenParams.model,
              status: (dream.status as StudioJob["status"]) || "queue",
              selectedForUprez: false,
            });

            if (outputPlaylistId) {
              await axiosClient.put(
                `/v1/playlist/${outputPlaylistId}/add-item`,
                {
                  type: "dream",
                  uuid: dream.uuid,
                },
              );
            }
          }),
        );

        for (const result of results) {
          if (result.status === "rejected") {
            console.error("Failed to retry job:", result.reason);
          }
        }
      }
    } finally {
      setIsRetrying(false);
    }
  }, [
    jobs,
    images,
    actions,
    videoGenParams,
    createDream,
    removeJob,
    addJob,
    outputPlaylistId,
  ]);

  return (
    <>
      <ProgressBar>
        <ProgressInfo>
          <span>
            {completedCount} of {totalCount} complete
          </span>
          <span>
            {timeEstimate && <TimeEstimate>{timeEstimate}</TimeEstimate>}
            {progressPercent}%
          </span>
        </ProgressInfo>
        <ProgressTrack>
          <ProgressFill $percent={progressPercent} />
        </ProgressTrack>
      </ProgressBar>

      <GenerateSection>
        <SectionTitle>Results Matrix</SectionTitle>
        {jobs.length === 0 ? (
          <p style={{ fontSize: "0.875rem", color: "#888" }}>
            No jobs submitted yet. Go to the Generate tab to start a batch.
          </p>
        ) : (
          <ScrollableGrid>
            <GridTable>
              <thead>
                <tr>
                  <GridHeader />
                  {gridActions.map((action) =>
                    action ? (
                      <GridHeader key={action.id} title={action.prompt}>
                        {action.prompt.slice(0, 20)}...
                      </GridHeader>
                    ) : null,
                  )}
                </tr>
              </thead>
              <tbody>
                {gridImages.map((image) =>
                  image ? (
                    <tr key={image.uuid}>
                      <GridRowHeader>{image.name}</GridRowHeader>
                      {gridActions.map((action) => {
                        if (!action) return null;
                        const job = jobMap.get(`${image.uuid}:${action.id}`);

                        if (!job) {
                          return (
                            <ResultCell key={`${image.uuid}:${action.id}`}>
                              <ResultCellStatus $color="#555">
                                --
                              </ResultCellStatus>
                            </ResultCell>
                          );
                        }

                        return (
                          <ResultCell
                            key={job.dreamUuid}
                            $status={job.status}
                            onClick={() => {
                              if (job.status === "processed") {
                                window.open(
                                  `/dream/${job.dreamUuid}`,
                                  "_blank",
                                );
                              }
                            }}
                          >
                            <ResultThumb>
                              {job.previewFrame ? (
                                <ResultThumbImg
                                  src={`data:image/jpeg;base64,${job.previewFrame}`}
                                  alt="preview"
                                />
                              ) : job.status === "processed" ? (
                                <ResultThumbImg
                                  as={PresignedImage}
                                  dreamUuid={job.dreamUuid}
                                  alt="thumbnail"
                                />
                              ) : null}

                              {job.status === "processed" && (
                                <UprezStarBadge
                                  $active={
                                    job.selectedForUprez || !!job.uprezed
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!job.uprezed) {
                                      toggleJobUprez(job.dreamUuid);
                                    }
                                  }}
                                  style={
                                    job.uprezed
                                      ? { opacity: 0.5, cursor: "default" }
                                      : undefined
                                  }
                                  title={
                                    job.uprezed ? "Already uprezed" : undefined
                                  }
                                >
                                  {job.uprezed
                                    ? "\u2713"
                                    : job.selectedForUprez
                                      ? "\u2605"
                                      : "\u2606"}
                                </UprezStarBadge>
                              )}
                            </ResultThumb>

                            <ResultCellStatus
                              $color={
                                job.status === "processed"
                                  ? "#6c6"
                                  : job.status === "failed"
                                    ? "#c66"
                                    : undefined
                              }
                            >
                              {job.status === "processed" && "done"}
                              {job.status === "processing" &&
                                `${job.progress ?? 0}%`}
                              {job.status === "queue" && "queued"}
                              {job.status === "failed" && "failed"}
                            </ResultCellStatus>
                          </ResultCell>
                        );
                      })}
                    </tr>
                  ) : null,
                )}
              </tbody>
            </GridTable>
          </ScrollableGrid>
        )}
      </GenerateSection>

      <ActionBar>
        {uprezableWanJobs.length > 0 && (
          <ActionButton
            onClick={
              allUprezableSelectedForUprez
                ? deselectAllJobsForUprez
                : selectAllJobsForUprez
            }
          >
            {allUprezableSelectedForUprez
              ? "Deselect All for Uprez"
              : "Select All for Uprez"}
          </ActionButton>
        )}
        <StyledSelect
          value={uprezModel}
          onChange={(e) => setUprezModel(e.target.value as UprezModel)}
          style={{ width: "auto", minWidth: 180 }}
        >
          {(Object.keys(UPREZ_MODEL_LABELS) as UprezModel[]).map((m) => (
            <option key={m} value={m}>
              {UPREZ_MODEL_LABELS[m]}
            </option>
          ))}
        </StyledSelect>
        <ActionButton
          $variant="primary"
          disabled={uprezCount === 0 || isUprezzing}
          onClick={handleUprezSelected}
        >
          {isUprezzing ? "Uprezzing..." : `Uprez Selected (${uprezCount})`}
        </ActionButton>
        {failedCount > 0 && (
          <ActionButton onClick={handleRetryFailed} disabled={isRetrying}>
            {isRetrying ? "Retrying..." : `Retry Failed (${failedCount})`}
          </ActionButton>
        )}
        {outputPlaylistId && (
          <ActionButton
            onClick={() =>
              window.open(`/playlist/${outputPlaylistId}`, "_blank")
            }
          >
            View Playlist
          </ActionButton>
        )}
        {uprezPlaylistId && (
          <ActionButton
            onClick={() =>
              window.open(`/playlist/${uprezPlaylistId}`, "_blank")
            }
          >
            View Uprez Playlist
          </ActionButton>
        )}
        <ActionButton
          onClick={() => setActiveTab("generate")}
          style={{ marginLeft: "auto" }}
        >
          &larr; Back to Generate
        </ActionButton>
      </ActionBar>
    </>
  );
};
