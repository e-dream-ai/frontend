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
  SectionActions,
  SelectionButton,
  SelectionCount,
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
}

export const ReferenceFrameStrip: React.FC<Props> = ({
  onAddUpload,
  onAddGenerate,
  onAddFromPlaylist,
  onAddFromLibrary,
}) => {
  // Actions (stable refs)
  const removeReferenceFrame = useFlowStore((s) => s.removeReferenceFrame);
  const reorderReferenceFrames = useFlowStore((s) => s.reorderReferenceFrames);
  const setLoop = useFlowStore((s) => s.setLoop);
  const selectTransition = useFlowStore((s) => s.selectTransition);
  const toggleTransitionSelection = useFlowStore(
    (s) => s.toggleTransitionSelection,
  );
  const selectAllTransitions = useFlowStore((s) => s.selectAllTransitions);
  const clearTransitionSelection = useFlowStore(
    (s) => s.clearTransitionSelection,
  );

  // Data
  const rawFrames = useFlowStore((s) => s.referenceFrames);
  const loop = useFlowStore((s) => s.loop);
  const transitions = useFlowStore((s) => s.transitions);
  const globalDuration = useFlowStore((s) => s.globalDuration);
  const selectedIndices = useFlowStore((s) => s.selectedTransitionIndices);

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
            selected={selectedIndices.includes(transitionIndex)}
            onClick={({ toggle }) => {
              if (toggle) toggleTransitionSelection(transitionIndex);
              else selectTransition(transitionIndex);
              // Clicking a transition plays it, every time — including when it
              // was already the selected one, where nothing about the
              // selection changes and there is no state transition to react
              // to. A shift-click that removed it is the one exception:
              // playing what you just deselected is not what was asked for.
              const store = useFlowStore.getState();
              if (!store.selectedTransitionIndices.includes(transitionIndex)) {
                return;
              }
              const clicked = store.transitions[transitionIndex];
              if (clicked?.status === "processed" && clicked.dreamUuid) {
                store.requestPreviewPlay(clicked.dreamUuid);
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
        <SectionActions>
          {selectedIndices.length > 1 && (
            <SelectionCount>{selectedIndices.length} selected</SelectionCount>
          )}
          {transitions.length > 0 && (
            <>
              <SelectionButton
                type="button"
                disabled={selectedIndices.length === transitions.length}
                onClick={() => selectAllTransitions()}
              >
                Select all
              </SelectionButton>
              <SelectionButton
                type="button"
                disabled={selectedIndices.length === 0}
                onClick={() => clearTransitionSelection()}
              >
                Clear all
              </SelectionButton>
            </>
          )}
          <FlowReset />
        </SectionActions>
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
