import type { Dream } from "@/types/dream.types";
import type { StudioJob } from "@/types/studio.types";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import { resolveJobSettings } from "../utils/job-settings";
import { mediaAspectRatio } from "../utils/media-aspect-ratio";
import { formatRunTime } from "../utils/transition-history.util";
import { VIDEO_MODEL_LABELS } from "../constants/video-model-labels";
import {
  Overlay,
  Header,
  Title,
  CloseBtn,
  Footer,
  FooterButtons,
  CancelBtn,
  AddBtn,
} from "./select-modal.styled";
import {
  HistoryClipPanel,
  HistoryClipBody,
  HistoryClipVideo,
  HistoryClipInfo,
  HistoryClipNote,
} from "./history-clip-dialog.styled";

interface Props {
  job: StudioJob;
  dream?: Dream;
  imageName: string;
  /** Whether its image is gone, and would come back with it. */
  imageRemoved: boolean;
  /** Its column number while the action is in the matrix. */
  actionNumber?: number;
  actionPrompt?: string;
  /** Whether its action is gone, and would come back with it. */
  actionRemoved: boolean;
  /** The clip its cell holds now, which putting this back would replace. */
  current?: StudioJob;
  /** The cell is still rendering, so nothing can go back in it yet. */
  blocked: boolean;
  onPutBack: () => void;
  onClose: () => void;
}

const formatDuration = (ms: number) => {
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
};

/**
 * A clip from history, played full size with what is known about it, and the
 * choice to put it back in its cell. Nothing changes until that is chosen.
 */
export const HistoryClipDialog: React.FC<Props> = ({
  job,
  dream,
  imageName,
  imageRemoved,
  actionNumber,
  actionPrompt,
  actionRemoved,
  current,
  blocked,
  onPutBack,
  onClose,
}) => {
  const overlayRef = useLightboxA11y<HTMLDivElement>(onClose);
  const url = dream?.original_video || dream?.video;
  const ratio = mediaAspectRatio(
    dream?.processedMediaWidth,
    dream?.processedMediaHeight,
  );
  const settings = resolveJobSettings(job, dream?.prompt);
  const generatedAt =
    job.completedAt ??
    (dream ? Date.parse(dream.processed_at ?? dream.created_at) : NaN);
  const renderMs =
    job.startedAt && job.completedAt
      ? job.completedAt - job.startedAt
      : undefined;

  const settingsText = settings
    ? [
        VIDEO_MODEL_LABELS[settings.model],
        settings.duration !== undefined && `${settings.duration}s`,
        settings.numInferenceSteps !== undefined &&
          `${settings.numInferenceSteps} steps`,
        settings.guidance !== undefined &&
          Number.isFinite(settings.guidance) &&
          `guidance ${settings.guidance}`,
        settings.seed !== undefined && `seed ${settings.seed}`,
      ]
        .filter(Boolean)
        .join(" · ")
    : undefined;

  const comesBack = [
    imageRemoved && "its image",
    actionRemoved && "its action",
  ].filter(Boolean);

  return (
    <Overlay ref={overlayRef} tabIndex={-1} onClick={onClose}>
      <HistoryClipPanel
        role="dialog"
        aria-modal="true"
        aria-label="Clip from history"
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          <Title>{dream?.name ?? "Clip"}</Title>
          <CloseBtn onClick={onClose} aria-label="Close">
            &times;
          </CloseBtn>
        </Header>
        <HistoryClipBody>
          <HistoryClipVideo $ratio={ratio}>
            {url ? (
              <video
                src={url}
                poster={dream?.thumbnail}
                controls
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <span>{dream ? "No video for this clip" : "Loading…"}</span>
            )}
          </HistoryClipVideo>
          <HistoryClipInfo>
            <dt>Image</dt>
            <dd>
              {imageName}
              {imageRemoved && " (removed)"}
            </dd>
            <dt>Action</dt>
            <dd>
              {actionNumber !== undefined
                ? `${actionNumber}: `
                : actionRemoved
                  ? "(removed) "
                  : ""}
              {actionPrompt ?? "Unknown"}
            </dd>
            {settingsText && (
              <>
                <dt>Settings</dt>
                <dd>{settingsText}</dd>
              </>
            )}
            <dt>Generated</dt>
            <dd>
              {Number.isFinite(generatedAt) ? formatRunTime(generatedAt) : "…"}
              {renderMs !== undefined && ` · took ${formatDuration(renderMs)}`}
            </dd>
          </HistoryClipInfo>
          <HistoryClipNote>
            {blocked
              ? "Its cell is still rendering; this can go back once that finishes."
              : [
                  current?.status === "processed" &&
                    "Putting this back moves the clip now in its cell to History.",
                  comesBack.length > 0 &&
                    `Putting this back also brings back ${comesBack.join(
                      " and ",
                    )}.`,
                ]
                  .filter(Boolean)
                  .join(" ")}
          </HistoryClipNote>
        </HistoryClipBody>
        <Footer>
          <span />
          <FooterButtons>
            <CancelBtn onClick={onClose}>Close</CancelBtn>
            <AddBtn onClick={onPutBack} disabled={blocked}>
              Put back
            </AddBtn>
          </FooterButtons>
        </Footer>
      </HistoryClipPanel>
    </Overlay>
  );
};
