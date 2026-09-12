import { useEffect, useMemo, useState } from "react";
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

  const [index, setIndex] = useState(0);

  // Segments drop dreams whose video hasn't landed, so look a dream up by key
  // rather than by its position among the transitions.
  const segmentKeys = segments.map((segment) => segment.key).join(",");

  useEffect(() => {
    if (!primaryDreamUuid) return;
    const next = segmentKeys.split(",").indexOf(primaryDreamUuid);
    // A selected transition that hasn't rendered yet has no segment to show —
    // leave whatever is playing alone rather than jumping to an unrelated clip.
    if (next >= 0) setIndex(next);
  }, [primaryDreamUuid, segmentKeys]);

  // An explicit play request seeks to the segment and, via replayToken,
  // restarts it even when it is already the one on screen.
  const [replayToken, setReplayToken] = useState(0);
  useEffect(() => {
    if (!playRequest) return;
    const next = segmentKeys.split(",").indexOf(playRequest.dreamUuid);
    if (next < 0) return;
    setIndex(next);
    setReplayToken(playRequest.seq);
  }, [playRequest, segmentKeys]);

  return (
    <SegmentPreview
      segments={segments}
      index={index}
      onIndexChange={setIndex}
      lightboxOpen={previewLightboxOpen}
      onLightboxOpenChange={setPreviewLightboxOpen}
      label="Preview"
      keyboardDisabled={frameLightboxOpen}
      divider="top"
      replayToken={replayToken}
    />
  );
}
