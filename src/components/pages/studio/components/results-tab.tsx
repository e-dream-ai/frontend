import React, { useCallback, useMemo, useState } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useCreateDreamFromPrompt } from "@/api/dream/mutation/useCreateDreamFromPrompt";
import { axiosClient } from "@/client/axios.client";
import { createComboKey } from "@/types/studio.types";
import type { StudioJob } from "@/types/studio.types";
import { GenerateSection, SectionTitle } from "./images-tab.styled";
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
} from "./results-tab.styled";

export const ResultsTab: React.FC = () => {
  const images = useStudioStore((s) => s.images);
  const actions = useStudioStore((s) => s.actions);
  const jobs = useStudioStore((s) => s.jobs);
  const toggleJobUprez = useStudioStore((s) => s.toggleJobUprez);
  const addJob = useStudioStore((s) => s.addJob);
  const outputPlaylistId = useStudioStore((s) => s.outputPlaylistId);
  const setActiveTab = useStudioStore((s) => s.setActiveTab);
  const createDream = useCreateDreamFromPrompt();

  const wanParams = useStudioStore((s) => s.wanParams);
  const removeJob = useStudioStore((s) => s.removeJob);

  const [isUprezzing, setIsUprezzing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Derive grid dimensions from jobs (not from selected/enabled filters)
  const gridImageIds = useMemo(() => {
    const ids = new Set<string>();
    jobs
      .filter((j) => j.jobType !== "uprez")
      .forEach((j) => ids.add(j.imageId));
    return [...ids];
  }, [jobs]);

  const gridActionIds = useMemo(() => {
    const ids = new Set<string>();
    jobs
      .filter((j) => j.jobType !== "uprez")
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
    () => jobs.filter((j) => j.jobType !== "uprez"),
    [jobs],
  );
  const completedCount = wanJobs.filter((j) => j.status === "processed").length;
  const totalCount = wanJobs.length;
  const failedCount = wanJobs.filter((j) => j.status === "failed").length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const uprezCount = jobs.filter((j) => j.selectedForUprez).length;

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

  const getJob = useCallback(
    (imageUuid: string, actionId: string) =>
      jobs.find(
        (j) =>
          j.imageId === imageUuid &&
          j.actionId === actionId &&
          j.jobType !== "uprez",
      ),
    [jobs],
  );

  const handleUprezSelected = useCallback(async () => {
    const toUprez = jobs.filter(
      (j) =>
        j.selectedForUprez && j.status === "processed" && j.jobType !== "uprez",
    );
    if (toUprez.length === 0) return;

    setIsUprezzing(true);
    try {
      for (const job of toUprez) {
        const algoParams = {
          infinidream_algorithm: "uprez",
          video_uuid: job.dreamUuid,
          upscale_factor: 2,
          interpolation_factor: 2,
        };

        try {
          const response = await createDream.mutateAsync({
            name: `Uprez - ${job.dreamUuid.slice(0, 8)}`,
            prompt: JSON.stringify(algoParams),
            description: `Uprez of ${job.dreamUuid}`,
          });

          const dream = response.data?.dream;
          if (!dream) continue;

          addJob({
            imageId: job.imageId,
            actionId: `uprez-${job.actionId}`,
            dreamUuid: dream.uuid,
            jobType: "uprez",
            status: (dream.status as StudioJob["status"]) || "queue",
            selectedForUprez: false,
          });

          if (outputPlaylistId) {
            await axiosClient.put(`/v1/playlist/${outputPlaylistId}/add-item`, {
              type: "dream",
              uuid: dream.uuid,
            });
          }
        } catch (err) {
          console.error("Failed to create uprez job:", err);
        }
      }
    } finally {
      setIsUprezzing(false);
    }
  }, [jobs, createDream, addJob, outputPlaylistId]);

  const handleRetryFailed = useCallback(async () => {
    // Only retry wan-i2v jobs (uprez retries not yet supported)
    const failedJobs = jobs.filter(
      (j) => j.status === "failed" && j.jobType !== "uprez",
    );
    if (failedJobs.length === 0) return;

    setIsRetrying(true);
    try {
      for (const job of failedJobs) {
        const image = images.find((img) => img.uuid === job.imageId);
        const action = actions.find((a) => a.id === job.actionId);
        if (!image || !action) continue;

        const hasLoras =
          (action.highNoiseLoras && action.highNoiseLoras.length > 0) ||
          (action.lowNoiseLoras && action.lowNoiseLoras.length > 0);

        const batchIdentifier = createComboKey(image.uuid, action.prompt);

        const algoParams = hasLoras
          ? {
              infinidream_algorithm: "wan-i2v-lora" as const,
              prompt: action.prompt,
              image: image.uuid,
              duration: wanParams.duration,
              num_inference_steps: wanParams.numInferenceSteps,
              guidance: wanParams.guidance,
              seed: -1,
              high_noise_loras: action.highNoiseLoras ?? [],
              low_noise_loras: action.lowNoiseLoras ?? [],
            }
          : {
              infinidream_algorithm: "wan-i2v" as const,
              prompt: action.prompt,
              image: image.uuid,
              size: image.size || "1280*720",
              duration: wanParams.duration,
              num_inference_steps: wanParams.numInferenceSteps,
              guidance: wanParams.guidance,
            };

        try {
          const response = await createDream.mutateAsync({
            name: `${image.name} - ${action.prompt.slice(0, 40)}`,
            prompt: JSON.stringify(algoParams),
            description: `Studio batch retry. BATCH_IDENTIFIER:${batchIdentifier}`,
          });

          const dream = response.data?.dream;
          if (!dream) continue;

          removeJob(job.dreamUuid);
          addJob({
            imageId: job.imageId,
            actionId: job.actionId,
            dreamUuid: dream.uuid,
            jobType: "wan-i2v",
            status: (dream.status as StudioJob["status"]) || "queue",
            selectedForUprez: false,
          });

          if (outputPlaylistId) {
            await axiosClient.put(`/v1/playlist/${outputPlaylistId}/add-item`, {
              type: "dream",
              uuid: dream.uuid,
            });
          }
        } catch (err) {
          console.error("Failed to retry job:", err);
        }
      }
    } finally {
      setIsRetrying(false);
    }
  }, [
    jobs,
    images,
    actions,
    wanParams,
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
            {timeEstimate && (
              <span style={{ marginRight: "1rem", color: "#888" }}>
                {timeEstimate}
              </span>
            )}
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
          <div style={{ overflowX: "auto" }}>
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
                        const job = getJob(image.uuid, action.id);

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
                              ) : null}

                              {job.status === "processed" && (
                                <UprezStarBadge
                                  $active={job.selectedForUprez}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleJobUprez(job.dreamUuid);
                                  }}
                                >
                                  {job.selectedForUprez ? "\u2605" : "\u2606"}
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
          </div>
        )}
      </GenerateSection>

      <ActionBar>
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
