import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { useStudioStore, comboKeyOf } from "@/stores/studio.store";
import { useBatchSubmit } from "../hooks/useBatchSubmit";
import {
  findCellJob,
  isAnimatableFrame,
  isCellChecked,
  isJobInFlight,
  isRunnableAction,
  jobCompletion,
} from "../utils/batch-selectors";
import type { StudioJob, VideoModel } from "@/types/studio.types";
import {
  clampDurationToAllowed,
  getAllowedDurationsForActions,
} from "../constants/duration-options";
import {
  GUIDANCE_PARAM,
  clampGuidance,
  defaultGuidanceForModel,
  resolveGuidanceConstraint,
} from "../constants/guidance-options";
import { SEED_HINT } from "../constants/seed-options";
import { useSeedInput } from "../hooks/useSeedInput";
import { GuidanceField } from "./guidance-field";
import { useModelConstraints } from "@/api/model/query/useModelConstraints";
import { useModels } from "@/api/model/query/useModels";
import { CostEstimate } from "@/components/shared/cost-estimate/cost-estimate";
import { CreditLimitNotice } from "@/components/shared/credit-limit-notice/credit-limit-notice";
import { useCostEstimate } from "@/hooks/useCostEstimate";
import { useCreditGuard } from "@/hooks/useCreditGuard";
import { PresignedImage } from "@/components/shared/presigned-image";
import { FilmstripIcon } from "./filmstrip-icon";
import { SegmentPreview } from "./segment-preview";
import { useHoverTooltip } from "./hover-tooltip";
import { ChipRail, SegmentChip } from "./segment-preview.styled";
import { useDreamSegments } from "../hooks/useDreamSegments";
import { useRetryFailedJobs } from "../hooks/useRetryFailedJobs";
import { useDiscardStudioClip } from "../hooks/useStudioClipActions";
import { ClipHistory } from "./clip-history";
import { ForceSettingsDialog } from "./force-settings-dialog";
import queryClient from "@/api/query-client";
import { DREAM_QUERY_KEY } from "@/api/dream/query/useDream";
import type { Dream } from "@/types/dream.types";
import type { ApiResponse } from "@/types/api.types";
import {
  resolveJobSettings,
  settingsDiffer,
  settingsPatch,
} from "../utils/job-settings";
import {
  GenerateSection,
  SectionTitle,
  FormField,
  FieldLabel,
  StyledSelect,
  NavButton,
  SectionHeaderRow,
  ButtonRow,
} from "./images-tab.styled";
import {
  TabLayout,
  TabColumn,
  CombinationGrid,
  GridTable,
  GridHeader,
  GridCorner,
  GridRowHeader,
  RowHeaderInner,
  RowThumb,
  RowName,
  GridCell,
  PreviewPlaceholder,
  PreviewCaption,
  CaptionFrame,
  CaptionThumb,
  CaptionName,
  CellFilmstrip,
  PlayingEye,
  CellCheckbox,
  CellStatus,
  SettingsGrid,
  ComboCountText,
  ActionGroup,
  SeedInput,
  ProgressBar,
  ProgressInfo,
  ProgressTrack,
  ProgressFill,
  TimeEstimate,
  JobActions,
  ActionButton,
  CellDiscard,
  SettingsSection,
  MatrixCheckButton,
  GenerateRow,
} from "./generate-tab.styled";

const VIDEO_MODEL_LABELS: Record<VideoModel, string> = {
  "ltx-i2v": "LTX 2.3",
  "wan-i2v": "Wan I2V",
  "kling-i2v": "Kling 3.0 Pro",
  "kling-25-i2v": "Kling 2.5 Turbo Pro",
};

/**
 * A job's settings, reading an older job's back from its dream's prompt when
 * the dream is already cached — the preview and the progress tracker fetch
 * every rendered and in-flight one.
 */
const jobSettingsOf = (job: StudioJob) =>
  resolveJobSettings(
    job,
    queryClient.getQueryData<ApiResponse<{ dream: Dream }>>([
      DREAM_QUERY_KEY,
      job.dreamUuid,
    ])?.data?.dream?.prompt,
  );

const VIDEO_MODELS: VideoModel[] = [
  "ltx-i2v",
  "wan-i2v",
  "kling-25-i2v",
  "kling-i2v",
];

const STEPS_OPTIONS = [20, 25, 30, 40];

const JOB_STATUS_LABELS: Record<StudioJob["status"], string> = {
  queue: "queued",
  processing: "rendering",
  processed: "done",
  failed: "failed",
};

// A rendering job shows how far along it is once the worker reports it.
const jobStatusLabel = (job: StudioJob) => {
  if (job.status !== "processing") return JOB_STATUS_LABELS[job.status];
  if (job.ingesting) return "ingesting";
  return job.progress !== undefined
    ? `${Math.round(job.progress)}%`
    : JOB_STATUS_LABELS[job.status];
};

export const GenerateTab: React.FC = () => {
  const images = useStudioStore((s) => s.images);
  const actions = useStudioStore((s) => s.actions);
  const videoGenParams = useStudioStore((s) => s.videoGenParams);
  const setVideoGenParams = useStudioStore((s) => s.setVideoGenParams);
  const excludedCombos = useStudioStore((s) => s.excludedCombos);
  const toggleComboExcluded = useStudioStore((s) => s.toggleComboExcluded);
  const rerenderCombos = useStudioStore((s) => s.rerenderCombos);
  const toggleComboRerender = useStudioStore((s) => s.toggleComboRerender);
  const setComboChecks = useStudioStore((s) => s.setComboChecks);
  const jobs = useStudioStore((s) => s.jobs);

  const { submit, isSubmitting, getPendingCombinations } = useBatchSubmit();

  const frames = useMemo(() => images.filter(isAnimatableFrame), [images]);
  const runnableActions = useMemo(
    () => actions.filter(isRunnableAction),
    [actions],
  );

  const newCombos = useMemo(
    () => getPendingCombinations(),
    [getPendingCombinations],
  );
  const modelConstraints = useModelConstraints({ mediaType: "video" });
  const durationOptions = useMemo(
    () =>
      getAllowedDurationsForActions(
        newCombos.map(({ action }) => action),
        modelConstraints.get(videoGenParams.model)?.durationsSec,
      ),
    [newCombos, videoGenParams.model, modelConstraints],
  );

  const { data: modelsData } = useModels({ mediaType: "video" });
  const modelOptions = modelsData?.data?.models ?? [];

  const { totalCostUsd, costBreakdown } = useCostEstimate({
    model: modelOptions.find((m) => m.id === videoGenParams.model),
    params: { durationSec: videoGenParams.duration },
    count: newCombos.length,
    breakdownKey: "components.cost_estimate.clips",
  });

  const { overBudget, canManageKey, resetIn, guardOverBudget } =
    useCreditGuard(totalCostUsd);

  const supportsSteps =
    modelConstraints.get(videoGenParams.model)?.supportsSteps ?? true;

  const guidanceConstraint = resolveGuidanceConstraint(
    videoGenParams.model,
    modelConstraints.get(videoGenParams.model),
  );
  const guidanceParam = GUIDANCE_PARAM[videoGenParams.model];
  const seedInput = useSeedInput(videoGenParams.seed, (seed) =>
    setVideoGenParams({ seed }),
  );

  // A new project carries no guidance of its own, so take the model's
  // catalog default once the constraints have arrived.
  useEffect(() => {
    if (!guidanceConstraint) return;
    if (Number.isFinite(videoGenParams.guidance)) return;
    setVideoGenParams({
      guidance: clampGuidance(guidanceConstraint.default, guidanceConstraint),
    });
  }, [guidanceConstraint, videoGenParams.guidance, setVideoGenParams]);

  useEffect(() => {
    const nextDuration = clampDurationToAllowed(
      videoGenParams.duration,
      durationOptions,
    );
    if (nextDuration !== videoGenParams.duration) {
      setVideoGenParams({ duration: nextDuration });
    }
  }, [durationOptions, videoGenParams.duration, setVideoGenParams]);

  const handleModelChange = (model: VideoModel) => {
    setVideoGenParams({
      model,
      guidance: defaultGuidanceForModel(
        videoGenParams.guidance,
        resolveGuidanceConstraint(model, modelConstraints.get(model)),
      ),
    });
  };

  const totalPossible = frames.length * runnableActions.length;
  const renderedCount = useMemo(
    () =>
      frames.reduce(
        (sum, image) =>
          sum +
          runnableActions.filter(
            (action) =>
              findCellJob(jobs, image.uuid, action.id)?.status === "processed",
          ).length,
        0,
      ),
    [frames, runnableActions, jobs],
  );

  const jobFor = useCallback(
    (imageUuid: string, actionId: string) =>
      findCellJob(jobs, imageUuid, actionId),
    [jobs],
  );

  const completedUuids = useMemo(() => {
    const uuids: string[] = [];
    const seen = new Set<string>();
    const push = (job?: StudioJob) => {
      if (job?.status !== "processed" || seen.has(job.dreamUuid)) return;
      seen.add(job.dreamUuid);
      uuids.push(job.dreamUuid);
    };

    // Grid reading order first — row by row, left to right — so stepping
    // through the preview walks the matrix the way it looks on screen.
    for (const image of frames) {
      for (const action of runnableActions) push(jobFor(image.uuid, action.id));
    }
    // Then every other clip that rendered: one whose image or action has since
    // been removed is still yours to watch.
    for (const job of jobs) {
      if (job.jobType !== "uprez") push(job);
    }
    return uuids;
  }, [frames, runnableActions, jobFor, jobs]);

  const segments = useDreamSegments(completedUuids);

  // Tracked by dream uuid, not position: the matrix fills in reading order, so
  // a clip finishing in an earlier cell would otherwise slide the index onto a
  // different one mid-playback.
  const [currentUuid, setCurrentUuid] = useState<string | null>(null);
  const foundIndex = segments.findIndex((s) => s.key === currentUuid);
  const previewIndex = foundIndex >= 0 ? foundIndex : 0;
  // What is actually on screen, which is not `currentUuid` until one has been
  // picked and differs again whenever the preview advances on its own. The eye
  // follows this so it never points at a clip that is not playing.
  const playingUuid = segments[previewIndex]?.key ?? null;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [replayToken, setReplayToken] = useState(0);
  const segmentKeys = useMemo(
    () => new Set(segments.map((s) => s.key)),
    [segments],
  );

  const playSegment = useCallback((dreamUuid: string) => {
    setCurrentUuid(dreamUuid);
    // Re-picking the clip already showing changes no prop the player would
    // notice, so the token is what restarts it.
    setReplayToken((n) => n + 1);
  }, []);

  const { retryFailed, isRetrying, failedCount } = useRetryFailedJobs();

  // A check held back until the combine dialog is answered.
  const [pendingCombine, setPendingCombine] = useState<{
    confirm: () => void;
    single: boolean;
  } | null>(null);

  /**
   * Checks or unchecks a rendered cell for re-rendering, keeping Settings in
   * step with the checked clips. The first one checked loads how it was made.
   * One made differently from what Settings now shows asks first: the checked
   * clips re-render together, with one set of settings.
   */
  /** Every matrix cell, with the clip it holds if any. */
  const matrixCells = () =>
    frames.flatMap((image) =>
      runnableActions.map((action) => ({
        key: comboKeyOf(image.uuid, action.id),
        job: jobFor(image.uuid, action.id),
      })),
    );

  /**
   * Checks every cell, finished ones included — which re-renders them. Same
   * rule as checking them one by one: with none picked yet, the first clip in
   * reading order sets Settings, and clips made differently ask first.
   */
  const checkAll = () => {
    const cells = matrixCells();
    const excluded = new Set(excludedCombos);
    const rerender = new Set(rerenderCombos);
    const clips: ReturnType<typeof jobSettingsOf>[] = [];
    for (const { key, job } of cells) {
      if (!job) excluded.delete(key);
      else if (!isJobInFlight(job)) {
        rerender.add(key);
        if (!rerenderCombos.has(key)) clips.push(jobSettingsOf(job));
      }
    }
    const known = clips.filter((c): c is NonNullable<typeof c> => !!c);
    const patch =
      rerenderCombos.size === 0 && known[0] ? settingsPatch(known[0]) : {};
    const reference = { ...videoGenParams, ...patch };
    const apply = () => {
      if (Object.keys(patch).length > 0) setVideoGenParams(patch);
      setComboChecks({ excludedCombos: excluded, rerenderCombos: rerender });
    };
    if (known.some((clip) => settingsDiffer(clip, reference))) {
      setPendingCombine({ confirm: apply, single: false });
    } else {
      apply();
    }
  };

  const uncheckAll = () => {
    const excluded = new Set(excludedCombos);
    for (const { key, job } of matrixCells()) if (!job) excluded.add(key);
    setComboChecks({ excludedCombos: excluded, rerenderCombos: new Set() });
  };

  /**
   * Checks a rendered cell for re-rendering by the rule above. Reads the store
   * fresh rather than this render's values, so it is also right when called
   * straight after a restore has just changed them.
   */
  const checkRenderedCell = (comboKey: string, job: StudioJob) => {
    const { rerenderCombos: picked, videoGenParams: panel } =
      useStudioStore.getState();
    if (picked.has(comboKey)) return;
    const clip = jobSettingsOf(job);
    if (clip) {
      if (picked.size === 0) {
        setVideoGenParams(settingsPatch(clip));
      } else if (settingsDiffer(clip, panel)) {
        setPendingCombine({
          confirm: () => toggleComboRerender(comboKey),
          single: true,
        });
        return;
      }
    }
    toggleComboRerender(comboKey);
  };

  const toggleRenderedCell = (comboKey: string, job: StudioJob) => {
    if (rerenderCombos.has(comboKey)) toggleComboRerender(comboKey);
    else checkRenderedCell(comboKey, job);
  };

  /** A clip back from history plays, and is checked like a click would. */
  const handleRestore = (dreamUuid: string) => {
    playSegment(dreamUuid);
    const job = useStudioStore
      .getState()
      .jobs.find((j) => j.dreamUuid === dreamUuid);
    if (job) checkRenderedCell(comboKeyOf(job.imageId, job.actionId), job);
  };
  const discardClip = useDiscardStudioClip();
  const hoverTip = useHoverTooltip();

  const playingJob = useMemo(
    () => jobs.find((j) => j.dreamUuid === playingUuid),
    [jobs, playingUuid],
  );
  // From `images` rather than `frames`: a clip outlives the filter that
  // decides which images are still animatable, and it should keep its name.
  const playingImage = useMemo(
    () => images.find((i) => i.uuid === playingJob?.imageId),
    [images, playingJob],
  );
  const playingActionIndex = playingJob
    ? runnableActions.findIndex((a) => a.id === playingJob.actionId)
    : -1;

  const submittedJobs = useMemo(
    () => jobs.filter((j) => j.jobType !== "uprez"),
    [jobs],
  );
  const doneCount = submittedJobs.filter(
    (j) => j.status === "processed",
  ).length;
  // Each job's own render and ingest progress, not just which have finished,
  // so the meter moves while clips are still rendering.
  const progressPercent =
    submittedJobs.length > 0
      ? Math.floor(
          (submittedJobs.reduce((sum, j) => sum + jobCompletion(j), 0) /
            submittedJobs.length) *
            100,
        )
      : 0;

  const timeEstimate = useMemo(() => {
    const done = submittedJobs.filter((j) => j.startedAt && j.completedAt);
    if (done.length === 0) return null;
    const avgMs =
      done.reduce((sum, j) => sum + (j.completedAt! - j.startedAt!), 0) /
      done.length;
    const failed = submittedJobs.filter((j) => j.status === "failed").length;
    const remaining = submittedJobs.length - doneCount - failed;
    if (remaining <= 0) return null;
    const minutes = Math.ceil((avgMs * remaining) / 60_000);
    return minutes <= 1 ? "~1 min remaining" : `~${minutes} min remaining`;
  }, [submittedJobs, doneCount]);

  return (
    <TabLayout>
      <TabColumn>
        {segments.length > 0 ? (
          <SegmentPreview
            segments={segments}
            index={previewIndex}
            onIndexChange={(next) =>
              setCurrentUuid(segments[next]?.key ?? null)
            }
            lightboxOpen={lightboxOpen}
            onLightboxOpenChange={setLightboxOpen}
            label="Preview"
            divider="bottom"
            replayToken={replayToken}
            caption={
              <PreviewCaption>
                <CaptionFrame>
                  {playingImage?.status === "processed" && (
                    <CaptionThumb
                      as={PresignedImage}
                      dreamUuid={playingImage.uuid}
                      alt=""
                    />
                  )}
                  <CaptionName>{playingImage?.name ?? "Clip"}</CaptionName>
                </CaptionFrame>

                <ChipRail role="tablist" aria-label="Actions">
                  {runnableActions.map((action, i) => {
                    const job = playingImage
                      ? jobFor(playingImage.uuid, action.id)
                      : undefined;
                    // Only a rendered clip of this same frame is somewhere to
                    // jump to; the rest are markers.
                    const target =
                      job?.status === "processed" &&
                      segmentKeys.has(job.dreamUuid)
                        ? job.dreamUuid
                        : undefined;
                    return (
                      <SegmentChip
                        key={action.id}
                        $active={i === playingActionIndex}
                        disabled={!target}
                        role="tab"
                        aria-selected={i === playingActionIndex}
                        aria-label={`Action ${i + 1}: ${action.prompt}`}
                        onClick={() => target && playSegment(target)}
                        onMouseEnter={(e) =>
                          hoverTip.show(e.currentTarget, action.prompt)
                        }
                        onMouseLeave={hoverTip.hide}
                      >
                        {i + 1}
                      </SegmentChip>
                    );
                  })}
                </ChipRail>
              </PreviewCaption>
            }
          />
        ) : (
          // SegmentPreview renders nothing at all with no segments, which read
          // as a broken panel now that this is the tab you land on.
          <PreviewPlaceholder>
            <FilmstripIcon size={44} />
            <span>
              {submittedJobs.length > 0
                ? "Clips appear here as they finish"
                : "Generate clips to preview them here"}
            </span>
          </PreviewPlaceholder>
        )}

        {submittedJobs.length > 0 && (
          <ProgressBar>
            <ProgressInfo>
              <span>
                {doneCount} of {submittedJobs.length} complete
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
        )}

        <CreditLimitNotice
          overBudget={overBudget}
          canManageKey={canManageKey}
          resetIn={resetIn}
        />

        <GenerateRow>
          {/* Sole child of a space-between row; keep it on the right. */}
          <ActionGroup style={{ marginLeft: "auto" }}>
            <CostEstimate amountUsd={totalCostUsd} breakdown={costBreakdown} />
            <NavButton
              onClick={() => {
                if (guardOverBudget()) return;
                submit();
              }}
              disabled={isSubmitting || newCombos.length === 0 || overBudget}
              style={{
                background:
                  newCombos.length === 0 || overBudget ? "#555" : undefined,
              }}
            >
              {isSubmitting
                ? "Submitting..."
                : `Generate ${newCombos.length} Videos`}
            </NavButton>
          </ActionGroup>
        </GenerateRow>

        <ClipHistory onRestore={handleRestore} />

        {failedCount > 0 && (
          <JobActions>
            <ActionButton onClick={retryFailed} disabled={isRetrying}>
              {isRetrying ? "Retrying..." : `Retry Failed (${failedCount})`}
            </ActionButton>
          </JobActions>
        )}
      </TabColumn>

      <TabColumn>
        <SettingsSection $hidden={newCombos.length === 0}>
          <SectionTitle>Settings</SectionTitle>
          <SettingsGrid>
            <FormField>
              <FieldLabel>Model:</FieldLabel>
              <StyledSelect
                value={videoGenParams.model}
                onChange={(e) =>
                  handleModelChange(e.target.value as VideoModel)
                }
              >
                {VIDEO_MODELS.map((m) => (
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
            {supportsSteps && (
              <FormField>
                <FieldLabel>Steps:</FieldLabel>
                <StyledSelect
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
                </StyledSelect>
              </FormField>
            )}
            {videoGenParams.model === "ltx-i2v" && (
              <FormField>
                <FieldLabel htmlFor="batch-seed" title={SEED_HINT}>
                  Seed:
                </FieldLabel>
                <SeedInput id="batch-seed" title={SEED_HINT} {...seedInput} />
              </FormField>
            )}
            {guidanceConstraint && guidanceParam && (
              <GuidanceField
                param={guidanceParam}
                constraint={guidanceConstraint}
                value={
                  Number.isFinite(videoGenParams.guidance)
                    ? videoGenParams.guidance
                    : guidanceConstraint.default
                }
                onChange={(guidance) => setVideoGenParams({ guidance })}
              />
            )}
          </SettingsGrid>
        </SettingsSection>
      </TabColumn>

      <TabColumn>
        <GenerateSection>
          <SectionHeaderRow>
            <SectionTitle>Matrix</SectionTitle>
            <ButtonRow>
              <MatrixCheckButton type="button" onClick={checkAll}>
                Check all
              </MatrixCheckButton>
              <MatrixCheckButton type="button" onClick={uncheckAll}>
                Uncheck all
              </MatrixCheckButton>
            </ButtonRow>
          </SectionHeaderRow>

          <CombinationGrid>
            <GridTable>
              <thead>
                <tr>
                  <GridCorner />
                  {runnableActions.map((action, i) => (
                    <GridHeader
                      key={action.id}
                      aria-label={action.prompt}
                      tabIndex={0}
                      onMouseEnter={(e) =>
                        hoverTip.show(e.currentTarget, action.prompt)
                      }
                      onMouseLeave={hoverTip.hide}
                      onFocus={(e) =>
                        hoverTip.show(e.currentTarget, action.prompt)
                      }
                      onBlur={hoverTip.hide}
                    >
                      {i + 1}
                    </GridHeader>
                  ))}
                </tr>
              </thead>
              <tbody>
                {frames.map((image) => (
                  <tr key={image.uuid}>
                    <GridRowHeader
                      onMouseEnter={(e) =>
                        hoverTip.show(e.currentTarget, image.name)
                      }
                      onMouseLeave={hoverTip.hide}
                    >
                      <RowHeaderInner>
                        {image.status === "processed" && (
                          <RowThumb
                            as={PresignedImage}
                            dreamUuid={image.uuid}
                            alt=""
                          />
                        )}
                        <RowName>{image.name}</RowName>
                      </RowHeaderInner>
                    </GridRowHeader>
                    {runnableActions.map((action) => {
                      const comboKey = comboKeyOf(image.uuid, action.id);
                      const job = jobFor(image.uuid, action.id);
                      const inFlight = job !== undefined && isJobInFlight(job);
                      const checked = isCellChecked(
                        job,
                        comboKey,
                        excludedCombos,
                        rerenderCombos,
                      );
                      const toggleChecked = () => {
                        if (inFlight) return;
                        if (job) toggleRenderedCell(comboKey, job);
                        else toggleComboExcluded(comboKey);
                      };
                      const actionNumber = runnableActions.indexOf(action) + 1;
                      // A processed job whose video has not resolved yet has
                      // no segment to seek to, so it is not playable.
                      const playable =
                        job?.status === "processed" &&
                        segmentKeys.has(job.dreamUuid);
                      const playing =
                        job !== undefined && job.dreamUuid === playingUuid;

                      const activate = () => {
                        if (playable && job) {
                          playSegment(job.dreamUuid);
                          return;
                        }
                        toggleChecked();
                      };

                      return (
                        <GridCell
                          key={comboKey}
                          $excluded={!job && !checked}
                          role={playable ? "button" : undefined}
                          title={playable ? "Play in preview" : undefined}
                          tabIndex={playable ? 0 : undefined}
                          onClick={activate}
                          onKeyDown={(e) => {
                            if (!playable) return;
                            if (e.key !== "Enter" && e.key !== " ") return;
                            e.preventDefault();
                            activate();
                          }}
                        >
                          <CellFilmstrip
                            $rendered={job?.status === "processed"}
                          >
                            <FilmstripIcon size={42} />
                            {/* Gold already says done; anything else is
                                spelled out on the glyph itself. */}
                            {job && job.status !== "processed" && (
                              <CellStatus $status={job.status}>
                                {jobStatusLabel(job)}
                              </CellStatus>
                            )}
                            {job && !inFlight && (
                              <CellDiscard
                                type="button"
                                title="Discard this clip"
                                aria-label={`Discard ${image.name} with action ${actionNumber}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  discardClip(job);
                                }}
                                onKeyDown={(e) => e.stopPropagation()}
                              >
                                &times;
                              </CellDiscard>
                            )}
                            {playing && (
                              <PlayingEye title="Showing in the preview">
                                <Eye size={11} strokeWidth={2.6} />
                              </PlayingEye>
                            )}
                          </CellFilmstrip>
                          <CellCheckbox
                            checked={checked}
                            disabled={inFlight}
                            title={
                              inFlight
                                ? "Generating"
                                : job
                                  ? "Re-render with the current settings"
                                  : "Generate this combination"
                            }
                            aria-label={`${job ? "Re-render" : "Generate"} ${
                              image.name
                            } with action ${actionNumber}`}
                            onChange={toggleChecked}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </GridCell>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </GridTable>
          </CombinationGrid>

          <ComboCountText>
            {newCombos.length} of {totalPossible} combinations checked to
            generate
            {renderedCount > 0 && ` (${renderedCount} rendered)`}
          </ComboCountText>
        </GenerateSection>
      </TabColumn>
      {hoverTip.tooltip}
      {pendingCombine && (
        <ForceSettingsDialog
          title="Clips have different settings"
          body={
            <>
              Checked clips re-render together with one set of settings &mdash;
              the ones shown now. Cancel leaves{" "}
              {pendingCombine.single ? "this clip" : "the clips"} unchecked.
            </>
          }
          confirmLabel="Combine"
          onConfirm={() => {
            pendingCombine.confirm();
            setPendingCombine(null);
          }}
          onCancel={() => setPendingCombine(null)}
        />
      )}
    </TabLayout>
  );
};
