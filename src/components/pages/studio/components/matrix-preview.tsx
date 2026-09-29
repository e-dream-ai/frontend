import { useMemo, useState } from "react";
import type {
  StudioAction,
  StudioImage,
  StudioJob,
} from "@/types/studio.types";
import { PresignedImage } from "@/components/shared/presigned-image";
import { comboKeyOf, type CellJobs } from "../utils/batch-selectors";
import { ROW_THUMB } from "../utils/sized-image";
import type { CrossfadeSegment } from "./crossfade-video";
import { FilmstripIcon } from "./filmstrip-icon";
import { useHoverTooltip } from "./hover-tooltip";
import { SegmentPreview } from "./segment-preview";
import { ChipRail, SegmentChip } from "./segment-preview.styled";
import { SectionTitle } from "./images-tab.styled";
import {
  CaptionFrame,
  CaptionName,
  CaptionThumb,
  PreviewCaption,
  PreviewPlaceholder,
} from "./generate-tab.styled";

interface Props {
  segments: readonly CrossfadeSegment[];
  previewIndex: number;
  replayToken: number;
  playingUuid: string | null;
  segmentKeys: ReadonlySet<string>;
  images: readonly StudioImage[];
  actions: readonly StudioAction[];
  jobs: readonly StudioJob[];
  cellJobs: CellJobs;
  hasSubmitted: boolean;
  onIndexChange: (index: number) => void;
  onPlay: (dreamUuid: string) => void;
}

export function MatrixPreview({
  segments,
  previewIndex,
  replayToken,
  playingUuid,
  segmentKeys,
  images,
  actions,
  jobs,
  cellJobs,
  hasSubmitted,
  onIndexChange,
  onPlay,
}: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hoverTip = useHoverTooltip();

  const playingJob = useMemo(
    () => jobs.find((j) => j.dreamUuid === playingUuid),
    [jobs, playingUuid],
  );
  const playingImage = useMemo(
    () => images.find((i) => i.uuid === playingJob?.imageId),
    [images, playingJob],
  );

  if (segments.length === 0) {
    return (
      <div>
        <SectionTitle>Preview</SectionTitle>
        <PreviewPlaceholder>
          <FilmstripIcon size={44} />
          <span>
            {hasSubmitted
              ? "Clips appear here as they finish"
              : "Generate clips to preview them here"}
          </span>
        </PreviewPlaceholder>
      </div>
    );
  }

  return (
    <>
      <SegmentPreview
        segments={segments}
        index={previewIndex}
        onIndexChange={onIndexChange}
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
                  resizeOptions={ROW_THUMB}
                  alt=""
                />
              )}
              <CaptionName>{playingImage?.name ?? "Clip"}</CaptionName>
            </CaptionFrame>

            <ChipRail role="group" aria-label="Actions">
              {actions.map((action, i) => {
                const job = playingImage
                  ? cellJobs.get(comboKeyOf(playingImage.uuid, action.id))
                  : undefined;
                const active = action.id === playingJob?.actionId;
                const target =
                  job?.status === "processed" && segmentKeys.has(job.dreamUuid)
                    ? job.dreamUuid
                    : undefined;
                return (
                  <SegmentChip
                    key={action.id}
                    type="button"
                    $active={active}
                    disabled={!target}
                    aria-current={active ? "true" : undefined}
                    aria-label={`Action ${i + 1}: ${action.prompt}`}
                    onClick={() => target && onPlay(target)}
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
      {hoverTip.tooltip}
    </>
  );
}
