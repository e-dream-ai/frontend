import { createPortal } from "react-dom";
import type { Dream } from "@/types/dream.types";
import type { TransitionHistoryEntry } from "@/types/flow.types";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import { mediaAspectRatio } from "../utils/media-aspect-ratio";
import { formatRunTime } from "../utils/transition-history.util";
import { SETTING_FIELDS } from "../utils/job-settings";
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
  entry: TransitionHistoryEntry;
  dream?: Dream;
  /** Which take it is, counting from the oldest. */
  takeNumber: number;
  takeCount: number;
  fromName: string;
  toName: string;
  /** It is the take in the flow now, so there is nothing to put back. */
  isCurrent: boolean;
  /** The flow's take has an upscale, which putting this back would drop. */
  dropsUprez: boolean;
  /** The transition is still rendering, so nothing can go back in it yet. */
  blocked: boolean;
  onPutBack: () => void;
  onClose: () => void;
}

/**
 * A take from a transition's history, played full size with what it was made
 * with, and the choice to put it back in the flow. Nothing changes until that
 * is chosen. The Flow counterpart of HistoryClipDialog.
 */
export const FlowTakeDialog: React.FC<Props> = ({
  entry,
  dream,
  takeNumber,
  takeCount,
  fromName,
  toName,
  isCurrent,
  dropsUprez,
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
  const { settings } = entry;

  // Only the fields its model actually uses; the rest never reached it.
  const fields = SETTING_FIELDS[settings.model];
  const settingsText = [
    VIDEO_MODEL_LABELS[settings.model],
    fields.includes("duration") && `${settings.duration}s`,
    fields.includes("numInferenceSteps") && `${settings.steps} steps`,
    fields.includes("guidance") &&
      Number.isFinite(settings.guidance) &&
      `guidance ${settings.guidance}`,
    fields.includes("seed") && `seed ${settings.seed}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const note = isCurrent
    ? "This is the take in the flow now."
    : blocked
      ? "This transition is still rendering; this can go back once that finishes."
      : [
          "Putting this back makes it the take in the flow and loads its settings into the panel.",
          dropsUprez && "The upscale of the current take is dropped.",
        ]
          .filter(Boolean)
          .join(" ");

  // Portalled out of the settings header, which clips and stacks its contents.
  return createPortal(
    <Overlay ref={overlayRef} tabIndex={-1} onClick={onClose}>
      <HistoryClipPanel
        role="dialog"
        aria-modal="true"
        aria-label="Take from history"
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          <Title>
            Take {takeNumber} of {takeCount}
          </Title>
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
              <span>{dream ? "No video for this take" : "Loading…"}</span>
            )}
          </HistoryClipVideo>
          <HistoryClipInfo>
            <dt>Frames</dt>
            <dd>
              {fromName} → {toName}
            </dd>
            <dt>Prompt</dt>
            <dd>{settings.prompt || "None"}</dd>
            {settings.negativePrompt && (
              <>
                <dt>Negative</dt>
                <dd>{settings.negativePrompt}</dd>
              </>
            )}
            <dt>Settings</dt>
            <dd>{settingsText}</dd>
            <dt>Generated</dt>
            <dd>{formatRunTime(entry.createdAt)}</dd>
          </HistoryClipInfo>
          <HistoryClipNote>{note}</HistoryClipNote>
        </HistoryClipBody>
        <Footer>
          <span />
          <FooterButtons>
            <CancelBtn onClick={onClose}>Close</CancelBtn>
            <AddBtn onClick={onPutBack} disabled={isCurrent || blocked}>
              Put back
            </AddBtn>
          </FooterButtons>
        </Footer>
      </HistoryClipPanel>
    </Overlay>,
    document.body,
  );
};
