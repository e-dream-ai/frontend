import { flowPartialize, useFlowStore } from "@/stores/flow.store";
import { studioPartialize, useStudioStore } from "@/stores/studio.store";
import { uprezPartialize, useUprezStore } from "@/stores/uprez.store";
import type { UprezFormState } from "@/stores/uprez.store";
import type { StudioMode } from "@/types/flow.types";
import type { EditorProjectState } from "@/types/editor-project.types";
import {
  fromPersistedActionState,
  fromPersistedFlowState,
  toPersistedActionState,
  toPersistedFlowState,
  type PersistedActionState,
  type PersistedFlowState,
} from "./editor-project-state";

export type EditorAdapter = {
  read: () => EditorProjectState;
  write: (state: EditorProjectState) => void;
  reset: () => void;
  subscribe: (listener: () => void) => () => void;
  isEmpty: () => boolean;
};

const flowAdapter: EditorAdapter = {
  read: () =>
    toPersistedFlowState(
      flowPartialize(useFlowStore.getState()),
    ) as EditorProjectState,
  write: (state) => {
    useFlowStore.setState(
      fromPersistedFlowState(state as PersistedFlowState) as Parameters<
        typeof useFlowStore.setState
      >[0],
    );
    useFlowStore.getState().reconcileStaleTransitions();
    useFlowStore.getState().recomputeTransitions();
  },
  reset: () => useFlowStore.getState().resetFlow(),
  subscribe: (listener) => useFlowStore.subscribe(listener),
  isEmpty: () => {
    const state = useFlowStore.getState();
    return (
      state.referenceFrames.length === 0 &&
      state.globalPrompt === "" &&
      state.transitions.length === 0
    );
  },
};

const actionAdapter: EditorAdapter = {
  read: () =>
    toPersistedActionState(
      studioPartialize(useStudioStore.getState()),
    ) as EditorProjectState,
  write: (state) => {
    useStudioStore.setState(
      fromPersistedActionState(state as PersistedActionState) as Parameters<
        typeof useStudioStore.setState
      >[0],
    );
  },
  reset: () => useStudioStore.getState().resetSession(),
  subscribe: (listener) => useStudioStore.subscribe(listener),
  isEmpty: () => {
    const state = useStudioStore.getState();
    return state.images.length === 0 && state.actions.length === 0;
  },
};

const uprezAdapter: EditorAdapter = {
  read: () => uprezPartialize(useUprezStore.getState()) as EditorProjectState,
  write: (state) =>
    useUprezStore.getState().restoreUprez(state as Partial<UprezFormState>),
  reset: () => useUprezStore.getState().resetUprez(),
  subscribe: (listener) => useUprezStore.subscribe(listener),
  isEmpty: () => !useUprezStore.getState().sourcePlaylist,
};

export const EDITOR_ADAPTERS: Record<StudioMode, EditorAdapter> = {
  flow: flowAdapter,
  action: actionAdapter,
  uprez: uprezAdapter,
};
