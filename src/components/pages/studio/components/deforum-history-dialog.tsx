import type { RemovedDeforumClip } from "@/types/deforum.types";
import { useStudioEditLock } from "../hooks/useStudioEditLock";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import { useDeforumLiveFrame } from "../hooks/useDeforumLiveFrame";
import { latestRender, pendingRender } from "../utils/deforum-targets";
import { renderFrames } from "../utils/deforum-params";
import { formatRunTime } from "../utils/transition-history.util";
import type { CrossfadeSegment } from "./crossfade-video";
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
  removed: RemovedDeforumClip;
  /** Its newest finished render, once the video has loaded. */
  segment?: CrossfadeSegment;
  onPutBack: () => void;
  onClose: () => void;
}

/**
 * A removed animation, played full size with its settings, and the choice to
 * put it back in the list. Nothing changes until that is chosen.
 */
export function DeforumHistoryDialog({
  removed,
  segment,
  onPutBack,
  onClose,
}: Props) {
  const overlayRef = useLightboxA11y<HTMLDivElement>(onClose);
  const { locked } = useStudioEditLock();
  const { clip } = removed;
  const shown = latestRender(clip);
  const pending = pendingRender(clip);
  const prompts = clip.settings.prompts.filter((p) => p.text.trim());
  const liveFrame = useDeforumLiveFrame(clip);

  return (
    <Overlay
      ref={overlayRef}
      tabIndex={-1}
      data-edit-lock-allow
      onClick={onClose}
    >
      <HistoryClipPanel
        role="dialog"
        aria-modal="true"
        aria-label="Animation from history"
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          <Title>{clip.name}</Title>
          <CloseBtn onClick={onClose} aria-label="Close">
            &times;
          </CloseBtn>
        </Header>
        <HistoryClipBody>
          <HistoryClipVideo
            $ratio={
              segment?.ratio ??
              `${clip.settings.width} / ${clip.settings.height}`
            }
          >
            {liveFrame ? (
              <img
                src={liveFrame}
                alt="Latest frame of the render in progress"
              />
            ) : segment ? (
              <video
                src={segment.url}
                poster={segment.poster}
                controls
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <span>
                {shown
                  ? "Loading…"
                  : pendingRender(clip)
                    ? "Still rendering…"
                    : "Never rendered"}
              </span>
            )}
          </HistoryClipVideo>
          <HistoryClipInfo>
            <dt>Prompts</dt>
            <dd>
              {prompts.length === 0
                ? "None"
                : prompts.map((p) => (
                    <div key={p.id}>
                      {p.frame}: {p.text}
                    </div>
                  ))}
            </dd>
            <dt>Settings</dt>
            <dd>
              {clip.settings.maxFrames} frames • {clip.settings.width}×
              {clip.settings.height} • {clip.settings.animationMode} • seed{" "}
              {clip.settings.seed}
            </dd>
            {liveFrame && pending ? (
              <>
                <dt>Showing</dt>
                <dd>
                  Latest frame of the {pending.kind} render, still in progress
                </dd>
              </>
            ) : (
              shown && (
                <>
                  <dt>Showing</dt>
                  <dd>
                    {shown.kind === "final"
                      ? `Final render, ${shown.render.settings.maxFrames} frames`
                      : `Test render, ${renderFrames(
                          shown.render.settings,
                          "test",
                        )} of ${shown.render.settings.maxFrames} frames`}
                  </dd>
                </>
              )
            )}
            <dt>Removed</dt>
            <dd>{formatRunTime(removed.removedAt)}</dd>
          </HistoryClipInfo>
          {locked ? null : (
            <HistoryClipNote>
              {clip.final?.status === "processed" &&
                "Putting this back returns its final render to the playlist."}
            </HistoryClipNote>
          )}
        </HistoryClipBody>
        <Footer>
          <span />
          <FooterButtons>
            <CancelBtn onClick={onClose}>Close</CancelBtn>
            {locked ? null : <AddBtn onClick={onPutBack}>Put back</AddBtn>}
          </FooterButtons>
        </Footer>
      </HistoryClipPanel>
    </Overlay>
  );
}
