import { useMemo, useState } from "react";
import { useDeforumStore } from "@/stores/deforum.store";
import type { DeforumClip } from "@/types/deforum.types";
import { useDeforumLiveFrame } from "../hooks/useDeforumLiveFrame";
import { useDreamSegments } from "../hooks/useDreamSegments";
import { latestRender, pendingRender } from "../utils/deforum-targets";
import { formatRunTime } from "../utils/transition-history.util";
import { HISTORY_THUMB, sizedImageUrl } from "../utils/sized-image";
import { SectionTitle } from "./images-tab.styled";
import { ClipHistoryGrid } from "./generate-tab.styled";
import {
  HistoryEmpty,
  HistoryItem,
  HistoryPlaceholder,
  HistoryThumb,
  HistoryTime,
} from "./transition-history.styled";
import { DeforumHistoryDialog } from "./deforum-history-dialog";
import { HistorySection } from "./deforum-app.styled";

/**
 * A render in progress shows its latest frame, as on the card; otherwise the
 * poster of the newest finished render.
 */
function HistoryThumbnail({
  clip,
  poster,
  rendered,
}: {
  clip: DeforumClip;
  poster?: string;
  /** It has a finished render, whose poster may still be loading. */
  rendered: boolean;
}) {
  const liveFrame = useDeforumLiveFrame(clip);
  if (liveFrame) return <img src={liveFrame} alt="" />;
  if (poster) {
    return (
      <img src={sizedImageUrl(poster, HISTORY_THUMB)} alt="" loading="lazy" />
    );
  }
  return (
    <HistoryPlaceholder>
      {rendered ? "…" : pendingRender(clip) ? "rendering…" : "not rendered"}
    </HistoryPlaceholder>
  );
}

/**
 * Animations removed from the list, newest first. Clicking one plays it with
 * its settings, and offers to put it back where it was.
 */
export function DeforumClipHistory() {
  const removedClips = useDeforumStore((s) => s.removedClips);
  const [openId, setOpenId] = useState<string | null>(null);

  const shownUuids = useMemo(
    () => removedClips.map((r) => latestRender(r.clip)?.render.dreamUuid ?? ""),
    [removedClips],
  );
  const segments = useDreamSegments(
    useMemo(() => shownUuids.filter(Boolean), [shownUuids]),
  );
  const segmentFor = (uuid: string) =>
    uuid ? segments.find((s) => s.key === uuid) : undefined;

  // Tracked by clip, so the dialog closes by itself once its clip is back.
  const open = removedClips.find((r) => r.clip.id === openId);

  return (
    <HistorySection>
      <SectionTitle>History</SectionTitle>
      {removedClips.length === 0 ? (
        <HistoryEmpty>Removed dreams show up here</HistoryEmpty>
      ) : (
        <ClipHistoryGrid role="list">
          {removedClips.map((removed, i) => {
            const poster = segmentFor(shownUuids[i])?.poster;
            const time = formatRunTime(removed.removedAt);
            return (
              <HistoryItem
                key={removed.clip.id}
                type="button"
                data-edit-lock-allow
                role="listitem"
                $current={false}
                title={removed.clip.name}
                aria-label={`${removed.clip.name}, removed ${time}. Activate to view it.`}
                onClick={() => setOpenId(removed.clip.id)}
              >
                <HistoryThumb $current={false}>
                  <HistoryThumbnail
                    clip={removed.clip}
                    poster={poster}
                    rendered={Boolean(shownUuids[i])}
                  />
                </HistoryThumb>
                <HistoryTime $current={false}>{time}</HistoryTime>
              </HistoryItem>
            );
          })}
        </ClipHistoryGrid>
      )}
      {open && (
        <DeforumHistoryDialog
          removed={open}
          segment={segmentFor(latestRender(open.clip)?.render.dreamUuid ?? "")}
          onPutBack={() => {
            setOpenId(null);
            useDeforumStore.getState().restoreClip(open.clip.id);
          }}
          onClose={() => setOpenId(null)}
        />
      )}
    </HistorySection>
  );
}
