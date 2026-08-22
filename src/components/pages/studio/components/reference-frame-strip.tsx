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
import { useFlowStore, buildFramesWithLoop } from "@/stores/flow.store";
import { ReferenceFrameCard } from "./reference-frame-card";
import { ReferenceFrameLightbox } from "./reference-frame-lightbox";
import { TransitionGapEnhanced } from "./transition-gap";
import { describeMismatch } from "../utils/frame-aspect";
import { FlowReset } from "./flow-reset";
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
} from "./reference-frame-strip.styled";

interface Props {
  onAddUpload: () => void;
  onAddGenerate: () => void;
  onAddFromPlaylist: () => void;
  onAddFromLibrary: () => void;
  onRetry: (index: number) => void;
}

export const ReferenceFrameStrip: React.FC<Props> = ({
  onAddUpload,
  onAddGenerate,
  onAddFromPlaylist,
  onAddFromLibrary,
  onRetry,
}) => {
  // Actions (stable refs)
  const removeReferenceFrame = useFlowStore((s) => s.removeReferenceFrame);
  const reorderReferenceFrames = useFlowStore((s) => s.reorderReferenceFrames);
  const setLoop = useFlowStore((s) => s.setLoop);
  const selectTransition = useFlowStore((s) => s.selectTransition);

  // Data
  const rawFrames = useFlowStore((s) => s.referenceFrames);
  const loop = useFlowStore((s) => s.loop);
  const transitions = useFlowStore((s) => s.transitions);
  const globalDuration = useFlowStore((s) => s.globalDuration);

  const displayFrames = useMemo(
    () => buildFramesWithLoop(rawFrames, loop),
    [rawFrames, loop],
  );

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

      const oldIndex = rawFrames.findIndex((frame) => frame.id === active.id);
      const newIndex = rawFrames.findIndex((frame) => frame.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = [...rawFrames];
      const [moved] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, moved);
      reorderReferenceFrames(newOrder.map((frame) => frame.id));
    },
    [rawFrames, reorderReferenceFrames],
  );

  // Build items with gaps interleaved
  const stripItems: React.ReactNode[] = [];
  const sortableIds = rawFrames.map((frame) => frame.id);

  displayFrames.forEach((frame, i) => {
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
            mismatch={describeMismatch(displayFrames[i - 1], frame)}
            onClick={() => {
              if (transition.status === "failed") {
                onRetry(transitionIndex);
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
      <ReferenceFrameCard
        key={frame.id}
        frame={frame}
        index={i}
        onDelete={removeReferenceFrame}
      />,
    );
  });

  return (
    <StripSection>
      <SectionHeader>
        <SectionLabel>Reference Frames</SectionLabel>
        <FlowReset />
      </SectionHeader>

      {displayFrames.length === 0 ? (
        <EmptyState>
          Add reference frames to get started. Generate, upload, or import from
          a playlist.
        </EmptyState>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          // Horizontal-only auto-scroll: reveal off-screen reference frames when a
          // dragged card nears the strip's left/right edge, without hijacking
          // vertical page scroll. y: 0 disables the vertical axis.
          autoScroll={{ threshold: { x: 0.2, y: 0 } }}
        >
          <SortableContext
            items={sortableIds}
            strategy={horizontalListSortingStrategy}
          >
            <StripContainer>{stripItems}</StripContainer>
          </SortableContext>
        </DndContext>
      )}

      <StripControls>
        <AddButtons>
          <AddButton onClick={onAddUpload}>
            <AddButtonPlus>+</AddButtonPlus> Upload
          </AddButton>
          <AddButton onClick={onAddGenerate}>
            <AddButtonPlus>+</AddButtonPlus> Generate
          </AddButton>
          <AddButton onClick={onAddFromPlaylist}>
            <AddButtonPlus>+</AddButtonPlus> From Playlist
          </AddButton>
          <AddButton onClick={onAddFromLibrary}>
            <AddButtonPlus>+</AddButtonPlus> My Images
          </AddButton>
        </AddButtons>

        {rawFrames.length >= 2 && (
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

      <ReferenceFrameLightbox />
    </StripSection>
  );
};
