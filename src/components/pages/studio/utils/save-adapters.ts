import { useFlowStore } from "@/stores/flow.store";
import { useStudioStore } from "@/stores/studio.store";
import type { StudioMode } from "@/types/flow.types";

export type EditorSaveAdapter = {
  pendingDreamUuids: () => string[];
  link: (playlistUuid: string) => void;
  defaultName: () => string;
};

const timestampedName = (prefix: string) =>
  `${prefix} ${new Date().toISOString().slice(0, 10)}`;

const flowSaveAdapter: EditorSaveAdapter = {
  pendingDreamUuids: () => [],
  link: (playlistUuid) =>
    useFlowStore.getState().linkSavedPlaylist(playlistUuid, []),
  defaultName: () => timestampedName("Flow"),
};

const actionSaveAdapter: EditorSaveAdapter = {
  pendingDreamUuids: () =>
    useStudioStore
      .getState()
      .jobs.filter((job) => job.status === "processed")
      .map((job) => job.dreamUuid),
  link: (playlistUuid) =>
    useStudioStore.getState().setOutputPlaylistId(playlistUuid),
  defaultName: () => timestampedName("Action"),
};

const uprezSaveAdapter: EditorSaveAdapter = {
  pendingDreamUuids: () => [],
  link: () => {},
  defaultName: () => timestampedName("Uprez"),
};

export const SAVE_ADAPTERS: Record<StudioMode, EditorSaveAdapter> = {
  flow: flowSaveAdapter,
  action: actionSaveAdapter,
  uprez: uprezSaveAdapter,
};
