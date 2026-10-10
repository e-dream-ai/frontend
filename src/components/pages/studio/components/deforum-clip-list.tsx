import type React from "react";
import { useShallow } from "zustand/react/shallow";
import { useDeforumStore } from "@/stores/deforum.store";
import type { DeforumClip, DeforumRenderKind } from "@/types/deforum.types";
import { useDreamPreviewFrame } from "@/api/dream/query/useDreamPreviewFrame";
import {
  isRenderBehind,
  latestRender,
  pendingRender,
} from "../utils/deforum-targets";
import {
  AddClipCard,
  ClipCard,
  ClipMeta,
  ClipName,
  ClipStrip,
  ClipThumb,
  SmallButton,
  StatusPill,
  StripActions,
  type PillTone,
} from "./deforum-app.styled";

const KIND_LABEL: Record<DeforumRenderKind, string> = {
  test: "Test",
  final: "Final",
};

function RenderPill({
  clip,
  kind,
}: {
  clip: DeforumClip;
  kind: DeforumRenderKind;
}) {
  const render = clip[kind];
  const label = KIND_LABEL[kind];
  if (!render) return <StatusPill $tone="none">{label} —</StatusPill>;

  let tone: PillTone = render.status;
  let text: string = render.status;
  if (render.status === "processing") {
    text =
      render.progress != null ? `${Math.round(render.progress)}%` : "rendering";
  } else if (render.status === "queue") {
    text = "queued";
  } else if (render.status === "processed" && isRenderBehind(clip, kind)) {
    // Rendered, but the settings have moved on since.
    tone = "stale";
    text = "edited";
  } else if (render.status === "processed") {
    text = "✓";
  }
  return (
    <StatusPill $tone={tone}>
      {label} {text}
    </StatusPill>
  );
}

/**
 * The card image: the latest frame of a render in progress when there is one,
 * otherwise the poster of the newest finished render.
 */
function ClipThumbnail({
  clip,
  poster,
  placeholder,
}: {
  clip: DeforumClip;
  poster?: string;
  placeholder: string;
}) {
  const pending = pendingRender(clip);
  const liveFrame = useDreamPreviewFrame(pending?.dreamUuid, Boolean(pending));
  const src = (pending && liveFrame) || poster;
  return (
    <ClipThumb
      $ratio={`${clip.settings.width} / ${clip.settings.height}`}
      $src={src}
    >
      {!src && placeholder}
    </ClipThumb>
  );
}

interface DeforumClipListProps {
  /** Poster per dream uuid, for whichever renders have one. */
  posters: ReadonlyMap<string, string>;
}

export function DeforumClipList({ posters }: DeforumClipListProps) {
  const { clips, selectedIds } = useDeforumStore(
    useShallow((s) => ({ clips: s.clips, selectedIds: s.selectedIds })),
  );
  const store = useDeforumStore.getState;
  const selected = new Set(selectedIds);

  const handleClick = (e: React.MouseEvent, id: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) store().toggleClipSelection(id);
    else if (selected.size === 1 && selected.has(id)) store().selectClip(null);
    else store().selectClip(id);
  };

  const primary = selectedIds[selectedIds.length - 1];

  return (
    <>
      <ClipStrip role="listbox" aria-multiselectable aria-label="Animations">
        {clips.map((clip) => {
          const shown = latestRender(clip);
          const firstPrompt = clip.settings.prompts.find((p) => p.text.trim());
          return (
            <ClipCard
              key={clip.id}
              role="option"
              aria-selected={selected.has(clip.id)}
              $selected={selected.has(clip.id)}
              onClick={(e) => handleClick(e, clip.id)}
              title="Click to edit · ⌘/Shift-click to edit several together"
            >
              <ClipThumbnail
                clip={clip}
                poster={shown ? posters.get(shown.dreamUuid) : undefined}
                placeholder={
                  shown ? "" : firstPrompt?.text.slice(0, 80) || "No prompt yet"
                }
              />
              <ClipName>{clip.name}</ClipName>
              <ClipMeta>
                <span>{clip.settings.maxFrames} frames</span>
                <span>{clip.settings.prompts.length} prompts</span>
              </ClipMeta>
              <ClipMeta>
                <RenderPill clip={clip} kind="test" />
                <RenderPill clip={clip} kind="final" />
              </ClipMeta>
            </ClipCard>
          );
        })}
        <AddClipCard onClick={() => store().addClip()}>+ Animation</AddClipCard>
      </ClipStrip>

      {clips.length > 0 && (
        <StripActions>
          <SmallButton onClick={() => store().selectAllClips()}>
            Select all
          </SmallButton>
          <SmallButton
            disabled={selectedIds.length === 0}
            onClick={() => store().selectClip(null)}
          >
            Clear selection
          </SmallButton>
          <SmallButton
            disabled={!primary || selectedIds.length !== 1}
            onClick={() => primary && store().moveClip(primary, -1)}
          >
            ← Move
          </SmallButton>
          <SmallButton
            disabled={!primary || selectedIds.length !== 1}
            onClick={() => primary && store().moveClip(primary, 1)}
          >
            Move →
          </SmallButton>
          <SmallButton
            disabled={selectedIds.length === 0}
            onClick={() => store().duplicateClips(selectedIds)}
          >
            Duplicate
          </SmallButton>
          <SmallButton
            disabled={selectedIds.length === 0}
            onClick={() => {
              const n = selectedIds.length;
              if (
                window.confirm(
                  `Remove ${n} animation${
                    n === 1 ? "" : "s"
                  }? Their final renders leave the playlist.`,
                )
              ) {
                store().removeClips(selectedIds);
              }
            }}
          >
            Remove
          </SmallButton>
        </StripActions>
      )}
    </>
  );
}
