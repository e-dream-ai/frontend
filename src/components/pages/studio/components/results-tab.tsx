import { DreamCardProgress } from "@/components/shared/dream-progress/dream-progress";
import React, { useCallback, useMemo, useState } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useCreateDreamFromPrompt } from "@/api/dream/mutation/useCreateDreamFromPrompt";
import { axiosClient } from "@/client/axios.client";
import { createComboKey } from "@/types/studio.types";
import type {
  StudioAction,
  StudioImage,
  StudioJob,
} from "@/types/studio.types";
import {
  clampDurationToAllowed,
  getAllowedDurationsForActions,
} from "../constants/duration-options";
import { useModelConstraints } from "@/api/model/query/useModelConstraints";
import { buildVideoAlgoParams } from "../utils/build-video-algo-params";
import { PresignedImage } from "@/components/shared/presigned-image";
import { GenerateSection, SectionTitle } from "./images-tab.styled";
import { GridTable, GridHeader, GridRowHeader } from "./generate-tab.styled";
import { SegmentPreview } from "./segment-preview";
import { useDreamSegments } from "../hooks/useDreamSegments";
import {
  ProgressBar,
  ProgressInfo,
  ProgressTrack,
  ProgressFill,
  ResultCell,
  ResultThumb,
  ResultThumbImg,
  ResultCellStatus,
  ActionBar,
  ActionGroup,
  ActionButton,
  ScrollableGrid,
  TimeEstimate,
} from "./results-tab.styled";

const BATCH_SIZE = 5;

const cellKey = (imageId: string, actionId: string) => `${imageId}:${actionId}`;

function orderedByFirstJob<T>(
  jobs: readonly StudioJob[],
  idOf: (job: StudioJob) => string,
  pool: readonly T[],
  keyOf: (item: T) => string,
): T[] {
  const byKey = new Map(pool.map((item) => [keyOf(item), item]));
  const seen = new Set<string>();
  const ordered: T[] = [];
  for (const job of jobs) {
    const id = idOf(job);
    if (seen.has(id)) continue;
    seen.add(id);
    const item = byKey.get(id);
    if (item) ordered.push(item);
  }
  return ordered;
}

export const ResultsTab: React.FC = () => {
  const images = useStudioStore((s) => s.images);
  const actions = useStudioStore((s) => s.actions);
  const jobs = useStudioStore((s) => s.jobs);
  const addJob = useStudioStore((s) => s.addJob);
  const outputPlaylistId = useStudioStore((s) => s.outputPlaylistId);
  const setActiveTab = useStudioStore((s) => s.setActiveTab);
  const createDream = useCreateDreamFromPrompt();

  const videoGenParams = useStudioStore((s) => s.videoGenParams);
  const removeJob = useStudioStore((s) => s.removeJob);
  const modelConstraints = useModelConstraints({ mediaType: "video" });

  const [isRetrying, setIsRetrying] = useState(false);

  const videoJobs = useMemo(
    () => jobs.filter((j) => j.jobType !== "uprez"),
    [jobs],
  );

  // Derive grid dimensions from the jobs themselves, not from the current
  // image/action lists — those can change after a batch is submitted.
  const gridImages = useMemo(
    () =>
      orderedByFirstJob<StudioImage>(
        videoJobs,
        (j) => j.imageId,
        images,
        (i) => i.uuid,
      ),
    [videoJobs, images],
  );

  const gridActions = useMemo(
    () =>
      orderedByFirstJob<StudioAction>(
        videoJobs,
        (j) => j.actionId,
        actions,
        (a) => a.id,
      ),
    [videoJobs, actions],
  );

  const { completedCount, failedCount } = useMemo(() => {
    let completed = 0;
    let failed = 0;
    for (const j of videoJobs) {
      if (j.status === "processed") completed++;
      else if (j.status === "failed") failed++;
    }
    return { completedCount: completed, failedCount: failed };
  }, [videoJobs]);

  const totalCount = videoJobs.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const timeEstimate = useMemo(() => {
    const done = videoJobs.filter((j) => j.startedAt && j.completedAt);
    if (done.length === 0) return null;
    const avgMs =
      done.reduce((sum, j) => sum + (j.completedAt! - j.startedAt!), 0) /
      done.length;
    const remaining = totalCount - completedCount - failedCount;
    if (remaining <= 0) return null;
    const estimateMs = avgMs * remaining;
    const minutes = Math.ceil(estimateMs / 60_000);
    return minutes <= 1 ? "~1 min remaining" : `~${minutes} min remaining`;
  }, [videoJobs, totalCount, completedCount, failedCount]);

  const jobMap = useMemo(
    () => new Map(videoJobs.map((j) => [cellKey(j.imageId, j.actionId), j])),
    [videoJobs],
  );

  // Reading order of the matrix — row by row, left to right — so stepping
  // through the preview walks the grid the way it looks on screen.
  const completedUuids = useMemo(() => {
    const uuids: string[] = [];
    for (const image of gridImages) {
      for (const action of gridActions) {
        const job = jobMap.get(cellKey(image.uuid, action.id));
        if (job?.status === "processed") uuids.push(job.dreamUuid);
      }
    }
    return uuids;
  }, [gridImages, gridActions, jobMap]);

  const segments = useDreamSegments(completedUuids);

  const [previewIndex, setPreviewIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Segments only exist once a dream's video has resolved, so positions here
  // don't line up with `completedUuids` — a cell has to look itself up.
  const segmentIndexByUuid = useMemo(
    () => new Map(segments.map((s, i) => [s.key, i])),
    [segments],
  );

  const openPreviewAt = useCallback((index: number) => {
    setPreviewIndex(index);
    setLightboxOpen(true);
  }, []);

  const handleRetryFailed = useCallback(async () => {
    // Only retry video generation jobs (uprez retries not yet supported)
    const failedJobs = jobs.filter(
      (j) => j.status === "failed" && j.jobType !== "uprez",
    );
    if (failedJobs.length === 0) return;

    const failedActionIds = new Set(failedJobs.map((j) => j.actionId));
    const allowedDurations = getAllowedDurationsForActions(
      actions.filter((action) => failedActionIds.has(action.id)),
      modelConstraints.get(videoGenParams.model)?.durationsSec,
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

            // Use the original job's model for retry, not the current selection
            const retryModel =
              job.jobType === "wan-i2v" || job.jobType === "ltx-i2v"
                ? job.jobType
                : videoGenParams.model;

            const batchIdentifier = createComboKey(image.uuid, action.prompt);

            const algoParams = buildVideoAlgoParams({
              model: retryModel,
              action,
              imageUuid: image.uuid,
              imageSize: image.size,
              duration,
              numInferenceSteps: videoGenParams.numInferenceSteps,
              guidance: videoGenParams.guidance,
              seed: videoGenParams.seed,
            });

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
              jobType: retryModel,
              status: (dream.status as StudioJob["status"]) || "queue",
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
    modelConstraints,
    createDream,
    removeJob,
    addJob,
    outputPlaylistId,
  ]);

  return (
    <>
      <SegmentPreview
        segments={segments}
        index={previewIndex}
        onIndexChange={setPreviewIndex}
        lightboxOpen={lightboxOpen}
        onLightboxOpenChange={setLightboxOpen}
        label="Preview"
        divider="bottom"
      />

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
                  {gridActions.map((action) => (
                    <GridHeader key={action.id} title={action.prompt}>
                      {action.prompt.slice(0, 20)}...
                    </GridHeader>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gridImages.map((image) => (
                  <tr key={image.uuid}>
                    <GridRowHeader>{image.name}</GridRowHeader>
                    {gridActions.map((action) => {
                      const key = cellKey(image.uuid, action.id);
                      const job = jobMap.get(key);

                      if (!job) {
                        return (
                          <ResultCell key={key}>
                            <ResultCellStatus $color="#555">
                              --
                            </ResultCellStatus>
                          </ResultCell>
                        );
                      }

                      const segmentIndex = segmentIndexByUuid.get(
                        job.dreamUuid,
                      );
                      const openable = segmentIndex !== undefined;
                      const open = () => {
                        if (segmentIndex !== undefined) {
                          openPreviewAt(segmentIndex);
                        }
                      };

                      return (
                        <ResultCell
                          key={key}
                          $clickable={openable}
                          title={openable ? "Open in preview" : undefined}
                          role={openable ? "button" : undefined}
                          tabIndex={openable ? 0 : undefined}
                          onClick={open}
                          onKeyDown={(e) => {
                            if (!openable) return;
                            if (e.key !== "Enter" && e.key !== " ") return;
                            e.preventDefault();
                            open();
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
                            <DreamCardProgress
                              dream={{
                                uuid: job.dreamUuid,
                                status: job.status,
                              }}
                            />
                            {job.status === "failed" && "failed"}
                          </ResultCellStatus>
                        </ResultCell>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </GridTable>
          </ScrollableGrid>
        )}
      </GenerateSection>

      <ActionBar>
        <ActionGroup>
          <ActionButton $accent onClick={() => setActiveTab("generate")}>
            &larr; Back to Generate
          </ActionButton>
        </ActionGroup>

        <ActionGroup>
          {failedCount > 0 && (
            <ActionButton onClick={handleRetryFailed} disabled={isRetrying}>
              {isRetrying ? "Retrying..." : `Retry Failed (${failedCount})`}
            </ActionButton>
          )}
          {outputPlaylistId && (
            <ActionButton
              $accent
              onClick={() =>
                window.open(`/playlist/${outputPlaylistId}`, "_blank")
              }
            >
              View Playlist
            </ActionButton>
          )}
        </ActionGroup>
      </ActionBar>
    </>
  );
};
