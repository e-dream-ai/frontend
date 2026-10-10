import { useEffect, useState } from "react";
import {
  PREVIEW_FRAME_POLL_MS,
  useDreamPreviewFrame,
} from "@/api/dream/query/useDreamPreviewFrame";
import type { DeforumClip, DeforumRender } from "@/types/deforum.types";
import { renderFrames } from "../utils/deforum-params";
import {
  LiveCaption,
  LiveFrame,
  LivePlaceholder,
  LivePreviewBox,
} from "./deforum-app.styled";

interface DeforumLivePreviewProps {
  clip: DeforumClip;
  render: DeforumRender;
}

/**
 * The latest frame of a render while it runs, refreshed every 15 seconds —
 * the frame the dream page's Preview button shows, fetched on a timer.
 */
export function DeforumLivePreview({ clip, render }: DeforumLivePreviewProps) {
  const frame = useDreamPreviewFrame(render.dreamUuid, true);
  const kind = render === clip.test ? "test" : "final";
  const frames = renderFrames(render.settings, kind);

  // Seconds since the frame on screen changed, so a stalled render is visible.
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => setShownAt(Date.now()), [frame]);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const age = Math.max(0, Math.round((now - shownAt) / 1000));

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
          src={frame}
          alt={`Latest frame of ${clip.name}`}
          style={{
            aspectRatio: `${clip.settings.width} / ${clip.settings.height}`,
          }}
        />
      ) : (
        <LivePlaceholder
          style={{
            aspectRatio: `${clip.settings.width} / ${clip.settings.height}`,
          }}
        >
          {render.status === "queue"
            ? "Waiting for a GPU…"
            : "Waiting for the first frame…"}
        </LivePlaceholder>
      )}
      <LiveCaption>
        {clip.name} · {kind} · {frames} frames · {status}
        {frame &&
          ` · frame changed ${age}s ago, checked every ${
            PREVIEW_FRAME_POLL_MS / 1000
          }s`}
      </LiveCaption>
    </LivePreviewBox>
  );
}
