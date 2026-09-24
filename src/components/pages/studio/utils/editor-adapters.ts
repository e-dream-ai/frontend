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
  thumbnailDreamUuid: () => string | null;
};

const flowAdapter: EditorAdapter = {
  read: () =>
    toPersistedFlowState(
      flowPartialize(useFlowStore.getState()),
    ) as EditorProjectState,
  write: (state) => {
    // `setState` merges, so the transient view state of whatever project was
    // open survives into this one unless it is cleared here. A selection is a
    // list of indices into a transition list that no longer exists; clearing it
    // also lets the recompute below re-select the loaded flow from scratch.
    useFlowStore.setState({
      ...fromPersistedFlowState(state as PersistedFlowState),
      selectedTransitionIndices: [],
      settingsExpanded: false,
      previewLightboxOpen: false,
      previewPlayRequest: null,
    } as Partial<ReturnType<typeof useFlowStore.getState>>);
    useFlowStore.getState().reconcileStaleTransitions();
    useFlowStore.getState().recomputeTransitions();
  },
  reset: () => useFlowStore.getState().resetFlow(),
  subscribe: (listener) => useFlowStore.subscribe(listener),
  thumbnailDreamUuid: () =>
    useFlowStore.getState().referenceFrames.find((frame) => frame.dreamUuid)
      ?.dreamUuid ?? null,
  isEmpty: () => {
    const state = useFlowStore.getState();
    // There are no global settings to check any more — a prompt only exists on
    // a transition, and a transition only exists between two frames.
    return state.referenceFrames.length === 0 && state.transitions.length === 0;
  },
};

const actionAdapter: EditorAdapter = {
  read: () =>
    toPersistedActionState(
      studioPartialize(useStudioStore.getState()),
    ) as EditorProjectState,
  write: (state) => {
    useStudioStore.setState({
      // Projects saved before history existed carry none; without this the
      // previous project's history would stay on screen.
      historyJobs: [],
      ...(fromPersistedActionState(state as PersistedActionState) as Parameters<
        typeof useStudioStore.setState
      >[0]),
      // A pending re-render pick belongs to the project being left.
      rerenderCombos: new Set<string>(),
    });
  },
  reset: () => useStudioStore.getState().resetSession(),
  subscribe: (listener) => useStudioStore.subscribe(listener),
  thumbnailDreamUuid: () =>
    useStudioStore
      .getState()
      .images.find((image) => image.status === "processed")?.uuid ?? null,
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
  thumbnailDreamUuid: () => null,
  isEmpty: () => !useUprezStore.getState().sourcePlaylist,
};

export const EDITOR_ADAPTERS: Record<StudioMode, EditorAdapter> = {
  flow: flowAdapter,
  action: actionAdapter,
  uprez: uprezAdapter,
};
