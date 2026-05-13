import React, { useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useFlowStore } from "@/stores/flow.store";
import { KeyframeCard } from "./keyframe-card";
import {
  StripSection,
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
} from "./keyframe-strip.styled";

interface Props {
  onAddGenerate: () => void;
  onAddUpload: () => void;
  onAddFromPlaylist: () => void;
}

export const KeyframeStrip: React.FC<Props> = ({
  onAddGenerate,
  onAddUpload,
  onAddFromPlaylist,
}) => {
  const removeKeyframe = useFlowStore((s) => s.removeKeyframe);
  const reorderKeyframes = useFlowStore((s) => s.reorderKeyframes);
  const setLoop = useFlowStore((s) => s.setLoop);
  const rawKeyframes = useFlowStore((s) => s.keyframes);

  // Reactive selector — subscribes to state changes and recomputes derived list
  const displayKeyframes = useFlowStore((s) => s.keyframesWithLoop());
  // Read loop separately for the checkbox (also ensures re-render on toggle)
  const loop = useFlowStore((s) => s.loop);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = rawKeyframes.findIndex((kf) => kf.id === active.id);
      const newIndex = rawKeyframes.findIndex((kf) => kf.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = [...rawKeyframes];
      const [moved] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, moved);
      reorderKeyframes(newOrder.map((kf) => kf.id));
    },
    [rawKeyframes, reorderKeyframes],
  );

  // Build items with gaps interleaved
  const stripItems: React.ReactNode[] = [];
  const sortableIds = rawKeyframes.map((kf) => kf.id);

  displayKeyframes.forEach((kf, i) => {
    if (i > 0) {
      stripItems.push(
        <TransitionGap key={`gap-${i}`}>
          <GapLine />
        </TransitionGap>,
      );
    }
    stripItems.push(
      <KeyframeCard
        key={kf.id}
        keyframe={kf}
        index={i}
        onDelete={removeKeyframe}
      />,
    );
  });

  return (
    <StripSection>
      <SectionLabel>Keyframes</SectionLabel>

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

      <StripControls>
        <AddButtons>
          <AddButton onClick={onAddGenerate}>
            <AddButtonPlus>+</AddButtonPlus> Generate
          </AddButton>
          <AddButton onClick={onAddUpload}>
            <AddButtonPlus>+</AddButtonPlus> Upload
          </AddButton>
          <AddButton onClick={onAddFromPlaylist}>
            <AddButtonPlus>+</AddButtonPlus> From Playlist
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
