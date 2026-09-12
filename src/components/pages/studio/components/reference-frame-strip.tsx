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
import { useShallow } from "zustand/react/shallow";
import { useFlowStore, buildFramesWithLoop } from "@/stores/flow.store";
import { ReferenceFrameCard } from "./reference-frame-card";
import { ReferenceFrameLightbox } from "./reference-frame-lightbox";
import { TransitionGapEnhanced } from "./transition-gap";
import { describeMismatch } from "../utils/frame-aspect";
import { FlowReset } from "./flow-reset";
import { ForceSettingsDialog } from "./force-settings-dialog";
import {
  forcedFieldPatch,
  mismatchedFields,
  type TransitionField,
  type TransitionGlobals,
} from "../utils/transition-field-values";
import { isTransitionStale } from "../utils/transition-staleness";
import {
  StripSection,
  SectionHeader,
  SectionLabel,
  SectionActions,
  SelectionButton,
  SelectionCount,
  StaleCount,
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
  const selectedIndices = useFlowStore((s) => s.selectedTransitionIndices);
  // Every global, because a transition without an override renders from them:
  // editing a global moves what the next run would produce, which is exactly
  // what the stale marker is about.
  const globals = useFlowStore(
    useShallow(
      (s): TransitionGlobals => ({
        globalPresetId: s.globalPresetId,
        globalPrompt: s.globalPrompt,
        globalNegativePrompt: s.globalNegativePrompt,
        globalDuration: s.globalDuration,
        globalModel: s.globalModel,
        globalNumInferenceSteps: s.globalNumInferenceSteps,
        globalGuidance: s.globalGuidance,
        globalSeed: s.globalSeed,
        globalLora: s.globalLora,
      }),
    ),
  );
  const globalDuration = globals.globalDuration;

  const staleFlags = useMemo(
    () =>
      transitions.map((transition) => isTransitionStale(transition, globals)),
    [transitions, globals],
  );
  const staleCount = staleFlags.filter(Boolean).length;

  const displayFrames = useMemo(
    () => buildFramesWithLoop(rawFrames, loop),
    [rawFrames, loop],
  );

  /** A selection held back until the user confirms unifying its settings. */
  const [pendingSelection, setPendingSelection] = useState<{
    confirm: () => void;
  } | null>(null);

  const playTransition = useCallback((index: number) => {
    const store = useFlowStore.getState();
    const transition = store.transitions[index];
    if (transition?.status === "processed" && transition.dreamUuid) {
      store.requestPreviewPlay(transition.dreamUuid);
    }
  }, []);

  /**
   * Select `next`, but only once those transitions agree about every setting:
   * the panel edits a selection as one thing, and there is no honest way to
   * show two values in one field. Anything they disagree about is settled here,
   * before the selection exists — confirm and the source's settings are forced
   * onto all of them, cancel and the selection is left alone.
   *
   * `source` is the primary of the selection being extended, so the values the
   * panel is already showing are the ones that win.
   */
  const selectWhenAligned = useCallback(
    (next: readonly number[], source: number, apply: () => void) => {
      const state = useFlowStore.getState();
      const globals: TransitionGlobals = {
        globalPresetId: state.globalPresetId,
        globalPrompt: state.globalPrompt,
        globalNegativePrompt: state.globalNegativePrompt,
        globalDuration: state.globalDuration,
        globalModel: state.globalModel,
        globalNumInferenceSteps: state.globalNumInferenceSteps,
        globalGuidance: state.globalGuidance,
        globalSeed: state.globalSeed,
        globalLora: state.globalLora,
      };
      const selected = next
        .map((index) => state.transitions[index])
        .filter((transition): transition is NonNullable<typeof transition> =>
          Boolean(transition),
        );
      const clashes: TransitionField[] = mismatchedFields(selected, globals);
      if (clashes.length === 0) {
        apply();
        return;
      }
      setPendingSelection({
        confirm: () => {
          const store = useFlowStore.getState();
          const from = store.transitions[source];
          if (from) {
            const patch = forcedFieldPatch(from, globals, clashes);
            for (const index of next) store.setTransitionOverride(index, patch);
          }
          apply();
        },
      });
    },
    [],
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
            stale={staleFlags[transitionIndex]}
            onClick={({ toggle }) => {
              // Clicking a transition plays it, every time — including when it
              // was already the selected one, where nothing about the
              // selection changes and there is no state transition to react
              // to. A shift-click that removed it is the one exception:
              // playing what you just deselected is not what was asked for.
              const current = useFlowStore.getState().selectedTransitionIndices;
              if (!toggle) {
                selectTransition(transitionIndex);
                playTransition(transitionIndex);
                return;
              }
              if (current.includes(transitionIndex)) {
                toggleTransitionSelection(transitionIndex);
                return;
              }
              selectWhenAligned(
                [...current, transitionIndex],
                current.length > 0
                  ? current[current.length - 1]
                  : transitionIndex,
                () => {
                  toggleTransitionSelection(transitionIndex);
                  playTransition(transitionIndex);
                },
              );
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
          {staleCount > 0 && (
            <StaleCount title="Rendered, then edited. Generate with nothing selected to bring them up to date.">
              {staleCount} edited
            </StaleCount>
          )}
          {transitions.length > 0 && (
            <>
              <SelectionButton
                type="button"
                disabled={selectedIndices.length === transitions.length}
                onClick={() => {
                  const current =
                    useFlowStore.getState().selectedTransitionIndices;
                  selectWhenAligned(
                    transitions.map((_, i) => i),
                    // Nothing selected yet, so nothing on screen to preserve:
                    // the first transition sets the value the rest take.
                    current.length > 0 ? current[current.length - 1] : 0,
                    selectAllTransitions,
                  );
                }}
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

      {pendingSelection && (
        <ForceSettingsDialog
          onConfirm={() => {
            pendingSelection.confirm();
            setPendingSelection(null);
          }}
          onCancel={() => setPendingSelection(null)}
        />
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
