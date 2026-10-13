import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDeforumStore } from "@/stores/deforum.store";
import { StudioFrame } from "../studio.page.styled";
import { useDeforumGeneration } from "../hooks/useDeforumGeneration";
import { useDeforumJobProgress } from "../hooks/useDeforumJobProgress";
import { useDeforumPlaylistSync } from "../hooks/useDeforumPlaylistSync";
import { useDreamSegments } from "../hooks/useDreamSegments";
import { useStudioEditLock } from "../hooks/useStudioEditLock";
import { renderFrames } from "../utils/deforum-params";
import { latestRender, liveRender } from "../utils/deforum-targets";
import { DeforumLivePreview } from "./deforum-live-preview";
import { DeforumClipList } from "./deforum-clip-list";
import { DeforumClipHistory } from "./deforum-clip-history";
import { DeforumSettingsPanel } from "./deforum-settings-panel";
import { SegmentPreview } from "./segment-preview";
import { EditLock } from "./edit-lock";
import { EmptyState, SmallButton } from "./deforum-app.styled";

export function DeforumApp() {
  const { locked } = useStudioEditLock();
  useDeforumJobProgress();
  useDeforumPlaylistSync(!locked);
  const { generate, isGenerating } = useDeforumGeneration();

  const { clips, selectedIds, hasHistory } = useDeforumStore(
    useShallow((s) => ({
      clips: s.clips,
      selectedIds: s.selectedIds,
      hasHistory: s.removedClips.length > 0,
    })),
  );

  // Each clip's newest finished render, test or final, in clip order.
  const shown = useMemo(
    () =>
      clips.flatMap((clip) => {
        const latest = latestRender(clip);
        return latest ? [{ clip, ...latest }] : [];
      }),
    [clips],
  );
  const segments = useDreamSegments(
    useMemo(() => shown.map((s) => s.render.dreamUuid), [shown]),
  );
  const posters = useMemo(
    () =>
      new Map(
        segments.flatMap((s) => (s.poster ? [[s.key, s.poster] as const] : [])),
      ),
    [segments],
  );

  const [currentUuid, setCurrentUuid] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Selecting a clip plays it, as selecting a transition does in the flow.
  const primaryId = selectedIds[selectedIds.length - 1];
  const primaryUuid = shown.find((s) => s.clip.id === primaryId)?.render
    .dreamUuid;
  const [followedUuid, setFollowedUuid] = useState<string>();
  if (
    primaryUuid !== followedUuid &&
    (!primaryUuid || segments.some((s) => s.key === primaryUuid))
  ) {
    setFollowedUuid(primaryUuid);
    if (primaryUuid) setCurrentUuid(primaryUuid);
  }

  const found = segments.findIndex((s) => s.key === currentUuid);
  const index = found >= 0 ? found : 0;

  const playing = shown.find(
    (s) => s.render.dreamUuid === segments[index]?.key,
  );
  const caption = playing
    ? playing.kind === "final"
      ? `${playing.clip.name} • final • ${playing.render.settings.maxFrames} frames`
      : `${playing.clip.name} • test • ${renderFrames(
          playing.render.settings,
          "test",
        )} of ${playing.render.settings.maxFrames} frames`
    : undefined;

  const live = liveRender(clips, primaryId);

  if (clips.length === 0) {
    return (
      <StudioFrame>
        <EmptyState>
          <p>
            Each animation is a deforum render: a list of prompts keyed to
            frames, plus global parameters. Test renders squeeze the whole
            timeline into 50 frames; final renders go into the playlist.
          </p>
          <EditLock>
            <SmallButton onClick={() => useDeforumStore.getState().addClip()}>
              + New animation
            </SmallButton>
          </EditLock>
        </EmptyState>
        {hasHistory && <DeforumClipHistory />}
      </StudioFrame>
    );
  }

  return (
    <StudioFrame>
      <EditLock>
        <DeforumClipList posters={posters} />
        <DeforumSettingsPanel
          onGenerate={(kind) => void generate(kind)}
          isGenerating={isGenerating}
        />
      </EditLock>
      {live && (
        <DeforumLivePreview
          key={live.render.dreamUuid}
          clip={live.clip}
          kind={live.kind}
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
      <DeforumClipHistory />
    </StudioFrame>
  );
}
