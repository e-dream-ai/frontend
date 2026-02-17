import React, { useCallback, useState } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useCreateDreamFromPrompt } from "@/api/dream/mutation/useCreateDreamFromPrompt";
import { axiosClient } from "@/client/axios.client";
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
  const createDream = useCreateDreamFromPrompt();

  const [isUprezzing, setIsUprezzing] = useState(false);

  const selectedImages = images.filter((img) => img.selected);
  const enabledActions = actions.filter((a) => a.enabled && a.prompt.trim());

  const completedCount = jobs.filter((j) => j.status === "processed").length;
  const totalCount = jobs.length;
  const failedCount = jobs.filter((j) => j.status === "failed").length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const uprezCount = jobs.filter((j) => j.selectedForUprez).length;

  const getJob = useCallback(
    (imageUuid: string, actionId: string) =>
      jobs.find((j) => j.imageId === imageUuid && j.actionId === actionId),
    [jobs],
  );

  const handleUprezSelected = useCallback(async () => {
    const toUprez = jobs.filter(
      (j) => j.selectedForUprez && j.status === "processed",
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
            status: dream.status as "queue",
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
        } catch (err) {
          console.error("Failed to create uprez job:", err);
        }
      }
    } finally {
      setIsUprezzing(false);
    }
  }, [jobs, createDream, addJob, outputPlaylistId]);

  return (
    <>
      <ProgressBar>
        <ProgressInfo>
          <span>
            {completedCount} of {totalCount} complete
          </span>
          <span>{progressPercent}%</span>
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
                      const job = getJob(image.uuid, action.id);

                      if (!job) {
                        return (
                          <ResultCell
                            key={`${image.uuid}:${action.id}`}
                          >
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
                ))}
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
          <ActionButton>Retry Failed ({failedCount})</ActionButton>
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
      </ActionBar>
    </>
  );
};
