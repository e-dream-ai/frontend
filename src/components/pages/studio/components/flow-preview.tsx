import { useEffect, useMemo, useRef, useState } from "react";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import { SegmentPreview } from "./segment-preview";
import { useDreamSegments } from "../hooks/useDreamSegments";

export function FlowPreview() {
  const {
    transitions,
    previewLightboxOpen,
    setPreviewLightboxOpen,
    frameLightboxOpen,
  } = useFlowStore(
    useShallow((s) => ({
      transitions: s.transitions,
      previewLightboxOpen: s.previewLightboxOpen,
      setPreviewLightboxOpen: s.setPreviewLightboxOpen,
      frameLightboxOpen: s.frameLightboxId !== null,
    })),
  );

  // The dream of the last-clicked transition. Selecting a transition should
  // play it, so the preview follows this rather than only advancing on its own.
  const primaryDreamUuid = useFlowStore((s) => {
    const selected = s.selectedTransitionIndices;
    if (selected.length === 0) return undefined;
    return s.transitions[selected[selected.length - 1]]?.dreamUuid;
  });
  const playRequest = useFlowStore((s) => s.previewPlayRequest);

  const completedUuids = useMemo(
    () =>
      transitions
        .filter((t) => t.status === "processed" && t.dreamUuid)
        .map((t) => t.dreamUuid as string),
    [transitions],
  );

  const segments = useDreamSegments(completedUuids);

  // Track what is on screen by dream uuid, not by position. Segments appear as
  // renders land, so a stored index quietly starts pointing at a different clip
  // every time the list grows — which looks like the preview jumping around on
  // its own. Deriving the index each render keeps the same clip playing.
  const [currentUuid, setCurrentUuid] = useState<string | null>(null);
  const foundIndex = segments.findIndex((s) => s.key === currentUuid);
  const index = foundIndex >= 0 ? foundIndex : 0;

  const followedUuidRef = useRef<string>();
  useEffect(() => {
    if (!primaryDreamUuid || primaryDreamUuid === followedUuidRef.current) {
      return;
    }
    // A selected transition that hasn't rendered yet has no segment to show —
    // leave whatever is playing alone rather than jumping to an unrelated clip.
    if (!segments.some((s) => s.key === primaryDreamUuid)) return;
    followedUuidRef.current = primaryDreamUuid;
    setCurrentUuid(primaryDreamUuid);
  }, [primaryDreamUuid, segments]);

  // An explicit play request seeks to the segment and, via replayToken,
  // restarts it even when it is already the one on screen.
  const [replayToken, setReplayToken] = useState(0);
  const handledSeqRef = useRef(0);
  useEffect(() => {
    if (!playRequest || playRequest.seq === handledSeqRef.current) return;
    if (!segments.some((s) => s.key === playRequest.dreamUuid)) return;
    handledSeqRef.current = playRequest.seq;
    setCurrentUuid(playRequest.dreamUuid);
    setReplayToken(playRequest.seq);
  }, [playRequest, segments]);

  return (
    <SegmentPreview
      segments={segments}
      index={index}
      onIndexChange={(next) => setCurrentUuid(segments[next]?.key ?? null)}
      lightboxOpen={previewLightboxOpen}
      onLightboxOpenChange={setPreviewLightboxOpen}
      label="Preview"
      keyboardDisabled={frameLightboxOpen}
      divider="top"
      replayToken={replayToken}
    />
  );
}
