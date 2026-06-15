import React, { useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useFlowStore, LOOP_KEYFRAME_ID } from "@/stores/flow.store";
import { shouldOpenVariationLightbox } from "../utils/variation-status";
import type { FlowKeyframe } from "@/types/flow.types";
import { KeyframeCard } from "./keyframe-card";
import { TransitionGapEnhanced } from "./transition-gap";
import {
  StripSection,
  SectionHeader,
  SectionLabel,
  StripContainer,
  TransitionGap,
  GapLine,
  StripControls,
  AddButtons,
  AddButton,
  AddButtonPlus,
  LoopToggle,
  LoopCheckbox,
  EmptyState,
  VariationsSection,
  VariationsLabel,
  VariationsRow,
} from "./keyframe-strip.styled";

interface Props {
  onAddUpload: () => void;
  onAddFromPlaylist: () => void;
  onAddFromLibrary: () => void;
  onRetry: (index: number) => void;
  onRequestVariations?: (keyframeId: string) => void;
  onOpenVariationLightbox?: (transitionIndex: number) => void;
  onRequestI2iVariation?: (keyframe: FlowKeyframe) => void;
  onAcceptI2iCandidate?: (keyframe: FlowKeyframe) => void;
  onDiscardI2iCandidate?: (keyframe: FlowKeyframe) => void;
}

export const KeyframeStrip: React.FC<Props> = ({
  onAddUpload,
  onAddFromPlaylist,
  onAddFromLibrary,
  onRetry,
  onRequestVariations,
  onOpenVariationLightbox,
  onRequestI2iVariation,
  onAcceptI2iCandidate,
  onDiscardI2iCandidate,
}) => {
  // Actions (stable refs)
  const removeKeyframe = useFlowStore((s) => s.removeKeyframe);
  const reorderKeyframes = useFlowStore((s) => s.reorderKeyframes);
  const setLoop = useFlowStore((s) => s.setLoop);
  const selectTransition = useFlowStore((s) => s.selectTransition);

  // Data
  const rawKeyframes = useFlowStore((s) => s.keyframes);
  const loop = useFlowStore((s) => s.loop);
  const transitions = useFlowStore((s) => s.transitions);
  const globalDuration = useFlowStore((s) => s.globalDuration);

  // i2i candidates are a staging area: they are excluded from the store's
  // `transitions` derivation (see timelineKeyframesWithLoop in flow.store). The
  // strip's timeline must be built from the SAME non-candidate list so the
  // transition-gap index mapping (transitionIndex = i - 1) lines up with the
  // `transitions` array. Candidates render separately, without gaps.
  const timelineKeyframes = useMemo(
    () => rawKeyframes.filter((kf) => !kf.i2iCandidate),
    [rawKeyframes],
  );
  const candidateKeyframes = useMemo(
    () => rawKeyframes.filter((kf) => kf.i2iCandidate),
    [rawKeyframes],
  );

  // Derive display keyframes (timeline + synthetic loop frame) from the
  // candidate-free list to avoid new-array-every-render.
  const displayKeyframes = useMemo(() => {
    if (!loop || timelineKeyframes.length < 2) return timelineKeyframes;
    const first = timelineKeyframes[0];
    return [
      ...timelineKeyframes,
      {
        id: LOOP_KEYFRAME_ID,
        keyframeUuid: first.keyframeUuid,
        dreamUuid: first.dreamUuid,
        imageUrl: first.imageUrl,
        name: first.name,
        isLoopKeyframe: true,
      },
    ];
  }, [timelineKeyframes, loop]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      // Only timeline (non-candidate) keyframes are sortable.
      const oldIndex = timelineKeyframes.findIndex((kf) => kf.id === active.id);
      const newIndex = timelineKeyframes.findIndex((kf) => kf.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = [...timelineKeyframes];
      const [moved] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, moved);
      // Preserve candidates (untouched by drag) so reorderKeyframes does not
      // drop them — it rebuilds keyframes from the id list it receives.
      reorderKeyframes([
        ...newOrder.map((kf) => kf.id),
        ...candidateKeyframes.map((kf) => kf.id),
      ]);
    },
    [timelineKeyframes, candidateKeyframes, reorderKeyframes],
  );

  // Build items with gaps interleaved. Only timeline keyframes are sortable;
  // candidates are excluded so they never participate in drag/gap interleaving.
  const stripItems: React.ReactNode[] = [];
  const sortableIds = timelineKeyframes.map((kf) => kf.id);

  displayKeyframes.forEach((kf, i) => {
    if (i > 0) {
      const transitionIndex = i - 1;
      const transition = transitions[transitionIndex];
      if (transition) {
        const effectiveDuration = transition.durationOverride ?? globalDuration;
        stripItems.push(
          <TransitionGapEnhanced
            key={`gap-${transitionIndex}`}
            transition={transition}
            effectiveDuration={effectiveDuration}
            onClick={() => {
              if (transition.status === "failed") {
                onRetry(transitionIndex);
              } else if (
                shouldOpenVariationLightbox(transition) &&
                onOpenVariationLightbox
              ) {
                // Processed single result OR a transition that owns variations
                // (in-flight or ready) — open the review lightbox.
                onOpenVariationLightbox(transitionIndex);
              } else {
                selectTransition(transitionIndex);
              }
            }}
          />,
        );
      } else {
        // Fallback for transitions not yet computed
        stripItems.push(
          <TransitionGap key={`gap-${i}`}>
            <GapLine />
          </TransitionGap>,
        );
      }
    }
    stripItems.push(
      <KeyframeCard
        key={kf.id}
        keyframe={kf}
        index={i}
        onDelete={removeKeyframe}
        onRequestVariations={onRequestVariations}
        onRequestI2iVariation={onRequestI2iVariation}
        onAcceptI2iCandidate={onAcceptI2iCandidate}
        onDiscardI2iCandidate={onDiscardI2iCandidate}
      />,
    );
  });

  return (
    <StripSection>
      <SectionHeader>
        <SectionLabel>Keyframes</SectionLabel>
      </SectionHeader>

      {displayKeyframes.length === 0 ? (
        <EmptyState>
          Add keyframes to get started. Generate, upload, or import from a
          playlist.
        </EmptyState>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortableIds}
            strategy={horizontalListSortingStrategy}
          >
            <StripContainer>{stripItems}</StripContainer>
          </SortableContext>
        </DndContext>
      )}

      {candidateKeyframes.length > 0 && (
        <VariationsSection>
          <VariationsLabel>Variations</VariationsLabel>
          <VariationsRow>
            {candidateKeyframes.map((kf, i) => (
              <KeyframeCard
                key={kf.id}
                keyframe={kf}
                index={i}
                onAcceptI2iCandidate={onAcceptI2iCandidate}
                onDiscardI2iCandidate={onDiscardI2iCandidate}
              />
            ))}
          </VariationsRow>
        </VariationsSection>
      )}

      <StripControls>
        <AddButtons>
          <AddButton onClick={onAddUpload}>
            <AddButtonPlus>+</AddButtonPlus> Upload
          </AddButton>
          <AddButton onClick={onAddFromPlaylist}>
            <AddButtonPlus>+</AddButtonPlus> From Playlist
          </AddButton>
          <AddButton onClick={onAddFromLibrary}>
            <AddButtonPlus>+</AddButtonPlus> My Images
          </AddButton>
        </AddButtons>

        {rawKeyframes.length >= 2 && (
          <LoopToggle>
            <LoopCheckbox
              type="checkbox"
              checked={loop}
              onChange={(e) => setLoop(e.target.checked)}
            />
            Loop
          </LoopToggle>
        )}
      </StripControls>
    </StripSection>
  );
};
