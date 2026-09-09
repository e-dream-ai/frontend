import { useMemo, useState } from "react";
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

  const completedUuids = useMemo(
    () =>
      transitions
        .filter((t) => t.status === "processed" && t.dreamUuid)
        .map((t) => t.dreamUuid as string),
    [transitions],
  );

  const segments = useDreamSegments(completedUuids);

  const [index, setIndex] = useState(0);

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
    />
  );
}
