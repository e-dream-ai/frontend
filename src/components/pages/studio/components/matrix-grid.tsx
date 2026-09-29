import { memo, useCallback, useState } from "react";
import { ArrowDown, ArrowRight, Eye, X } from "lucide-react";
import type {
  StudioAction,
  StudioImage,
  StudioJob,
} from "@/types/studio.types";
import { PresignedImage } from "@/components/shared/presigned-image";
import { DreamProgressOverlay } from "@/components/shared/dream-progress/dream-progress";
import {
  comboKeyOf,
  isAnimatableFrame,
  isCellChecked,
  isJobInFlight,
  type CellJobs,
} from "../utils/batch-selectors";
import { ROW_THUMB, sizedImageUrl } from "../utils/sized-image";
import { FilmstripIcon } from "./filmstrip-icon";
import {
  CellCheckbox,
  CellDiscard,
  CellFilmstrip,
  CellFailedLabel,
  CellFooter,
  CellProgress,
  CellProgressFill,
  CellProgressLabel,
  CellProgressSweep,
  CellProgressTrack,
  CellTile,
  type CellTone,
  CombinationGrid,
  CornerKey,
  GridCell,
  GridCorner,
  GridHeader,
  GridHeaderButton,
  GridHeaderIndex,
  GridHeaderLabel,
  GridRowHeader,
  GridTable,
  PendingRowHeader,
  PendingRowThumb,
  PlayingEye,
  RowHeaderInner,
  RowName,
  RowThumb,
} from "./generate-tab.styled";

interface CellPhase {
  label: string;
  percent?: number;
  busy: boolean;
}

const jobPhase = (job: StudioJob): CellPhase => {
  if (job.status === "queue") return { label: "Queued", busy: false };
  if (job.ingesting) return { label: "Finishing", busy: true };
  if (job.progress === undefined) return { label: "Rendering", busy: true };
  return {
    label: "Rendering",
    percent: Math.round(Math.min(Math.max(job.progress, 0), 100)),
    busy: true,
  };
};

const cellTone = (job: StudioJob | undefined, checked: boolean): CellTone => {
  if (!job) return checked ? "planned" : "skipped";
  if (job.status === "processed") return "rendered";
  if (job.status === "failed") return "failed";
  return "rendering";
};

interface HoverCell {
  imageUuid: string;
  actionId: string;
}

interface CellProps {
  imageUuid: string;
  imageName: string;
  actionId: string;
  actionNumber: number;
  job: StudioJob | undefined;
  checked: boolean;
  playable: boolean;
  playing: boolean;
  onHover: (imageUuid: string, actionId: string) => void;
  onPlay: (dreamUuid: string) => void;
  onToggle: (comboKey: string, job: StudioJob | undefined) => void;
  onDiscard: (job: StudioJob) => void;
}

const MatrixCell = memo(function MatrixCell({
  imageUuid,
  imageName,
  actionId,
  actionNumber,
  job,
  checked,
  playable,
  playing,
  onHover,
  onPlay,
  onToggle,
  onDiscard,
}: CellProps) {
  const comboKey = comboKeyOf(imageUuid, actionId);
  const inFlight = job !== undefined && isJobInFlight(job);
  const tone = cellTone(job, checked);
  const phase = inFlight ? jobPhase(job) : undefined;

  const toggleChecked = () => {
    if (!inFlight) onToggle(comboKey, job);
  };

  const activate = () => {
    if (playable && job) onPlay(job.dreamUuid);
    else toggleChecked();
  };

  return (
    <GridCell
      $band={actionNumber % 2 === 0}
      onMouseEnter={() => onHover(imageUuid, actionId)}
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
      <CellTile
        $tone={tone}
        $picked={job !== undefined && !inFlight && checked}
        $playing={playing}
      >
        {job && !inFlight && (
          <CellDiscard
            type="button"
            title="Discard this clip"
            aria-label={`Discard ${imageName} with action ${actionNumber}`}
            onClick={(e) => {
              e.stopPropagation();
              onDiscard(job);
            }}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <X size={12} strokeWidth={2.6} aria-hidden="true" />
          </CellDiscard>
        )}
        {playing && (
          <PlayingEye title="Showing in the preview">
            <Eye size={12} strokeWidth={2.4} aria-hidden="true" />
          </PlayingEye>
        )}
        <CellFilmstrip $tone={tone} $busy={phase?.busy}>
          <FilmstripIcon size={40} />
        </CellFilmstrip>
        <CellFooter>
          {phase ? (
            <CellProgress
              role="progressbar"
              aria-label={`${imageName} with action ${actionNumber}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={phase.percent}
              aria-valuetext={
                phase.percent === undefined
                  ? phase.label
                  : `${phase.label} ${phase.percent}%`
              }
            >
              <CellProgressLabel>
                <span>{phase.label}</span>
                {phase.percent !== undefined && <span>{phase.percent}%</span>}
              </CellProgressLabel>
              <CellProgressTrack>
                {phase.percent !== undefined ? (
                  <CellProgressFill $percent={phase.percent} />
                ) : (
                  phase.busy && <CellProgressSweep />
                )}
              </CellProgressTrack>
            </CellProgress>
          ) : (
            <>
              <CellCheckbox
                checked={checked}
                title={
                  job
                    ? "Re-render with the current settings"
                    : "Generate this combination"
                }
                aria-label={`${
                  job ? "Re-render" : "Generate"
                } ${imageName} with action ${actionNumber}`}
                onChange={toggleChecked}
                onClick={(e) => e.stopPropagation()}
              />
              {job?.status === "failed" && (
                <CellFailedLabel>Failed</CellFailedLabel>
              )}
            </>
          )}
        </CellFooter>
      </CellTile>
    </GridCell>
  );
});

const ColumnHeader = memo(function ColumnHeader({
  action,
  number,
  heading,
  lit,
  onOpen,
}: {
  action: StudioAction;
  number: number;
  heading: string;
  lit: boolean;
  onOpen: (actionId: string) => void;
}) {
  return (
    <GridHeader $band={number % 2 === 0} $lit={lit}>
      <GridHeaderButton
        type="button"
        aria-label={`Action ${number}: ${action.prompt}`}
        onClick={() => onOpen(action.id)}
      >
        <GridHeaderIndex>{number}</GridHeaderIndex>
        <GridHeaderLabel $lit={lit}>{heading}</GridHeaderLabel>
      </GridHeaderButton>
    </GridHeader>
  );
});

const RowHeader = memo(function RowHeader({
  image,
  lit,
  onOpen,
}: {
  image: StudioImage;
  lit: boolean;
  onOpen: (imageUuid: string) => void;
}) {
  return (
    <GridRowHeader $lit={lit}>
      <RowHeaderInner
        type="button"
        aria-label={image.name}
        onClick={() => onOpen(image.uuid)}
      >
        {image.status === "processed" && (
          <RowThumb
            as={PresignedImage}
            dreamUuid={image.uuid}
            resizeOptions={ROW_THUMB}
            alt=""
          />
        )}
        <RowName $lit={lit}>{image.name}</RowName>
      </RowHeaderInner>
    </GridRowHeader>
  );
});

const PendingRow = memo(function PendingRow({
  image,
  actions,
}: {
  image: StudioImage;
  actions: readonly StudioAction[];
}) {
  return (
    <tr>
      <GridRowHeader>
        <PendingRowHeader>
          <PendingRowThumb>
            {image.url && (
              <img src={sizedImageUrl(image.url, ROW_THUMB)} alt="" />
            )}
            <DreamProgressOverlay dream={image} />
          </PendingRowThumb>
          <RowName>{image.name}</RowName>
        </PendingRowHeader>
      </GridRowHeader>
      {actions.map((action, i) => (
        <GridCell key={action.id} $band={i % 2 === 1} $inert>
          <CellTile $tone="skipped">
            <CellFilmstrip $tone="skipped">
              <FilmstripIcon size={40} />
            </CellFilmstrip>
          </CellTile>
        </GridCell>
      ))}
    </tr>
  );
});

interface Props {
  rows: readonly StudioImage[];
  actions: readonly StudioAction[];
  headings: readonly string[];
  cellJobs: CellJobs;
  excludedCombos: ReadonlySet<string>;
  rerenderCombos: ReadonlySet<string>;
  segmentKeys: ReadonlySet<string>;
  playingUuid: string | null;
  onOpenAction: (actionId: string) => void;
  onOpenImage: (imageUuid: string) => void;
  onPlay: (dreamUuid: string) => void;
  onToggle: (comboKey: string, job: StudioJob | undefined) => void;
  onDiscard: (job: StudioJob) => void;
}

export function MatrixGrid({
  rows,
  actions,
  headings,
  cellJobs,
  excludedCombos,
  rerenderCombos,
  segmentKeys,
  playingUuid,
  onOpenAction,
  onOpenImage,
  onPlay,
  onToggle,
  onDiscard,
}: Props) {
  const [hoverCell, setHoverCell] = useState<HoverCell | null>(null);

  const handleHover = useCallback((imageUuid: string, actionId: string) => {
    setHoverCell((current) =>
      current?.imageUuid === imageUuid && current.actionId === actionId
        ? current
        : { imageUuid, actionId },
    );
  }, []);

  return (
    <CombinationGrid>
      <GridTable>
        <thead>
          <tr>
            <GridCorner>
              <CornerKey>
                <span>
                  Actions
                  <ArrowRight size={12} strokeWidth={2.2} aria-hidden="true" />
                </span>
                <span>
                  Images
                  <ArrowDown size={12} strokeWidth={2.2} aria-hidden="true" />
                </span>
              </CornerKey>
            </GridCorner>
            {actions.map((action, i) => (
              <ColumnHeader
                key={action.id}
                action={action}
                number={i + 1}
                heading={headings[i]}
                lit={hoverCell?.actionId === action.id}
                onOpen={onOpenAction}
              />
            ))}
          </tr>
        </thead>
        <tbody onMouseLeave={() => setHoverCell(null)}>
          {rows.map((image) =>
            !isAnimatableFrame(image) ? (
              <PendingRow key={image.uuid} image={image} actions={actions} />
            ) : (
              <tr key={image.uuid}>
                <RowHeader
                  image={image}
                  lit={hoverCell?.imageUuid === image.uuid}
                  onOpen={onOpenImage}
                />
                {actions.map((action, i) => {
                  const comboKey = comboKeyOf(image.uuid, action.id);
                  const job = cellJobs.get(comboKey);
                  return (
                    <MatrixCell
                      key={comboKey}
                      imageUuid={image.uuid}
                      imageName={image.name}
                      actionId={action.id}
                      actionNumber={i + 1}
                      job={job}
                      checked={isCellChecked(
                        job,
                        comboKey,
                        excludedCombos,
                        rerenderCombos,
                      )}
                      playable={
                        job?.status === "processed" &&
                        segmentKeys.has(job.dreamUuid)
                      }
                      playing={
                        job !== undefined && job.dreamUuid === playingUuid
                      }
                      onHover={handleHover}
                      onPlay={onPlay}
                      onToggle={onToggle}
                      onDiscard={onDiscard}
                    />
                  );
                })}
              </tr>
            ),
          )}
        </tbody>
      </GridTable>
    </CombinationGrid>
  );
}
