import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDeforumStore } from "@/stores/deforum.store";
import { StudioFrame } from "../studio.page.styled";
import { useDeforumGeneration } from "../hooks/useDeforumGeneration";
import { useDeforumJobProgress } from "../hooks/useDeforumJobProgress";
import { useDeforumPlaylistSync } from "../hooks/useDeforumPlaylistSync";
import { useDreamSegments } from "../hooks/useDreamSegments";
import { renderFrames } from "../utils/deforum-params";
import { latestRender, pendingRender } from "../utils/deforum-targets";
import { DeforumLivePreview } from "./deforum-live-preview";
import { DeforumClipList } from "./deforum-clip-list";
import { DeforumSettingsPanel } from "./deforum-settings-panel";
import { SegmentPreview } from "./segment-preview";
import { EmptyState, SmallButton } from "./deforum-app.styled";

export function DeforumApp() {
  useDeforumJobProgress();
  useDeforumPlaylistSync();
  const { generate, isGenerating } = useDeforumGeneration();

  const { clips, selectedIds } = useDeforumStore(
    useShallow((s) => ({ clips: s.clips, selectedIds: s.selectedIds })),
  );

  // Each clip's newest finished render, test or final, in clip order.
  const shown = useMemo(
    () =>
      clips.flatMap((clip) => {
        const render = latestRender(clip);
        return render ? [{ clip, render }] : [];
      }),
    [clips],
  );
  const segments = useDreamSegments(
    useMemo(() => shown.map((s) => s.render.dreamUuid), [shown]),
  );
  const posters = useMemo(
    () =>
      new Map(
        segments
          .filter((s) => s.poster)
          .map((s) => [s.key, s.poster as string]),
      ),
    [segments],
  );

  const [currentUuid, setCurrentUuid] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const found = segments.findIndex((s) => s.key === currentUuid);
  const index = found >= 0 ? found : 0;

  // Selecting a clip plays it, as selecting a transition does in the flow.
  const primaryId = selectedIds[selectedIds.length - 1];
  const primaryUuid = shown.find((s) => s.clip.id === primaryId)?.render
    .dreamUuid;
  useEffect(() => {
    if (primaryUuid && segments.some((s) => s.key === primaryUuid)) {
      setCurrentUuid(primaryUuid);
    }
  }, [primaryUuid, segments]);

  const playing = shown.find(
    (s) => s.render.dreamUuid === segments[index]?.key,
  );
  const caption = playing
    ? playing.render === playing.clip.final
      ? `${playing.clip.name} · final · ${playing.render.settings.maxFrames} frames`
      : `${playing.clip.name} · test · ${renderFrames(
          playing.render.settings,
          "test",
        )} of ${playing.render.settings.maxFrames} frames`
    : undefined;

  // Live frames follow the selected clip's render; with nothing selected (or
  // the selection idle), the most recently started render anywhere.
  const live =
    [
      clips.find((c) => c.id === primaryId),
      ...[...clips].sort(
        (a, b) =>
          (pendingRender(b)?.createdAt ?? 0) -
          (pendingRender(a)?.createdAt ?? 0),
      ),
    ]
      .map((clip) => clip && { clip, render: pendingRender(clip) })
      .find((entry) => entry?.render) ?? null;

  if (clips.length === 0) {
    return (
      <StudioFrame>
        <EmptyState>
          <p>
            Each animation is a deforum render: a list of prompts keyed to
            frames, plus global parameters. Test renders squeeze the whole
            timeline into 50 frames; final renders go into the playlist.
          </p>
          <SmallButton onClick={() => useDeforumStore.getState().addClip()}>
            + New animation
          </SmallButton>
        </EmptyState>
      </StudioFrame>
    );
  }

  return (
    <StudioFrame>
      <DeforumClipList posters={posters} />
      <DeforumSettingsPanel
        onGenerate={(kind) => void generate(kind)}
        isGenerating={isGenerating}
      />
      {live?.render && (
        <DeforumLivePreview
          key={live.render.dreamUuid}
          clip={live.clip}
          render={live.render}
        />
      )}
      <SegmentPreview
        segments={segments}
        index={index}
        onIndexChange={(next) => setCurrentUuid(segments[next]?.key ?? null)}
        lightboxOpen={lightboxOpen}
        onLightboxOpenChange={setLightboxOpen}
        label="Preview"
        caption={caption}
        divider="top"
      />
    </StudioFrame>
  );
}
