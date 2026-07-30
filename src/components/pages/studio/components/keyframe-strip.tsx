import React, { useCallback, useMemo, useState } from "react";
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
import { resolveFlowRatio } from "@/utils/aspect-crop";
import { KeyframeCard } from "./keyframe-card";
import { KeyframeCropModal } from "./keyframe-crop-modal";
import { TransitionGapEnhanced } from "./transition-gap";
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
} from "./keyframe-strip.styled";

interface Props {
  onAddUpload: () => void;
  onAddGenerate: () => void;
  onAddFromPlaylist: () => void;
  onAddFromLibrary: () => void;
  onRetry: (index: number) => void;
}

export const KeyframeStrip: React.FC<Props> = ({
  onAddUpload,
  onAddGenerate,
  onAddFromPlaylist,
  onAddFromLibrary,
  onRetry,
}) => {
  // Actions (stable refs)
  const removeKeyframe = useFlowStore((s) => s.removeKeyframe);
  const reorderKeyframes = useFlowStore((s) => s.reorderKeyframes);
  const setLoop = useFlowStore((s) => s.setLoop);
  const selectTransition = useFlowStore((s) => s.selectTransition);
  const setKeyframeCrop = useFlowStore((s) => s.setKeyframeCrop);

  // Data
  const rawKeyframes = useFlowStore((s) => s.keyframes);
  const loop = useFlowStore((s) => s.loop);
  const transitions = useFlowStore((s) => s.transitions);
  const globalDuration = useFlowStore((s) => s.globalDuration);
  const globalAspectRatio = useFlowStore((s) => s.globalAspectRatio);

  // Resolve the numeric output ratio (auto = the majority keyframe shape).
  const outputRatio = useMemo(
    () =>
      resolveFlowRatio(
        rawKeyframes.map((k) =>
          k.naturalWidth && k.naturalHeight
            ? { width: k.naturalWidth, height: k.naturalHeight }
            : undefined,
        ),
        globalAspectRatio,
      ),
    [rawKeyframes, globalAspectRatio],
  );

  // Crop editor state
  const [cropEditId, setCropEditId] = useState<string | null>(null);
  const cropEditKeyframe =
    cropEditId !== null
      ? rawKeyframes.find((kf) => kf.id === cropEditId) ?? null
      : null;

  // Derive display keyframes from raw data to avoid new-array-every-render
  const displayKeyframes = useMemo(() => {
    if (!loop || rawKeyframes.length < 2) return rawKeyframes;
    const first = rawKeyframes[0];
    return [
      ...rawKeyframes,
      {
        id: LOOP_KEYFRAME_ID,
        keyframeUuid: first.keyframeUuid,
        dreamUuid: first.dreamUuid,
        imageUrl: first.imageUrl,
        name: first.name,
        isLoopKeyframe: true,
      },
    ];
  }, [rawKeyframes, loop]);

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
        outputRatio={outputRatio}
        onDelete={removeKeyframe}
        onEditCrop={setCropEditId}
      />,
    );
  });

  return (
    <StripSection>
      <SectionHeader>
        <SectionLabel>Keyframes</SectionLabel>
        <FlowReset />
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

      {cropEditKeyframe && (
        <KeyframeCropModal
          keyframe={cropEditKeyframe}
          outputRatio={outputRatio}
          onSave={(crop) => {
            setKeyframeCrop(cropEditKeyframe.id, crop);
            setCropEditId(null);
          }}
          onClose={() => setCropEditId(null)}
        />
      )}
    </StripSection>
  );
};
