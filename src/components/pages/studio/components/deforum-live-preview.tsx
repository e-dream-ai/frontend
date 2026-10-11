import { useEffect, useState } from "react";
import {
  PREVIEW_FRAME_POLL_MS,
  useDreamPreviewFrame,
} from "@/api/dream/query/useDreamPreviewFrame";
import type {
  DeforumClip,
  DeforumRender,
  DeforumRenderKind,
} from "@/types/deforum.types";
import { renderFrames } from "../utils/deforum-params";
import {
  LiveCaption,
  LiveFrame,
  LivePlaceholder,
  LivePreviewBox,
} from "./deforum-app.styled";

interface DeforumLivePreviewProps {
  clip: DeforumClip;
  kind: DeforumRenderKind;
  render: DeforumRender;
}

function SecondsSince({ since }: { since: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return <>{Math.max(0, Math.round((now - since) / 1000))}</>;
}

/**
 * The latest frame of a render while it runs, refreshed every 15 seconds —
 * the frame the dream page's Preview button shows, fetched on a timer.
 */
export function DeforumLivePreview({
  clip,
  kind,
  render,
}: DeforumLivePreviewProps) {
  const frame = useDreamPreviewFrame(render.dreamUuid, true);
  const frames = renderFrames(render.settings, kind);
  const ratio = `${clip.settings.width} / ${clip.settings.height}`;

  const status =
    render.status === "queue"
      ? "queued"
      : render.progress != null
        ? `rendering ${Math.round(render.progress)}%`
        : "rendering";

  return (
    <LivePreviewBox>
      {frame ? (
        <LiveFrame
          src={frame.src}
          alt={`Latest frame of ${clip.name}`}
          $ratio={ratio}
        />
      ) : (
        <LivePlaceholder $ratio={ratio}>
          {render.status === "queue"
            ? "Waiting for a GPU…"
            : "Waiting for the first frame…"}
        </LivePlaceholder>
      )}
      <LiveCaption>
        {clip.name} · {kind} · {frames} frames · {status}
        {frame && (
          <>
            {" · frame changed "}
            <SecondsSince since={frame.changedAt} />
            {`s ago, checked every ${PREVIEW_FRAME_POLL_MS / 1000}s`}
          </>
        )}
      </LiveCaption>
    </LivePreviewBox>
  );
}
