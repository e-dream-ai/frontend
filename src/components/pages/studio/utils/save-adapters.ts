import { useFlowStore } from "@/stores/flow.store";
import { useStudioStore } from "@/stores/studio.store";
import { useDeforumStore } from "@/stores/deforum.store";
import { fetchDream } from "@/api/dream/query/useDream";
import { deforumPlaylistDreams } from "./deforum-targets";
import { imageOriginFromDreamPrompt } from "./image-prompt";
import {
  firstActionPrompt,
  firstDeforumPrompt,
  firstFlowPrompt,
  nameFromPrompt,
} from "./project-names";
import type { StudioMode } from "@/types/flow.types";

export type EditorSaveAdapter = {
  pendingDreamUuids: () => string[];
  link: (playlistUuid: string) => void;
  /**
   * The name a save gives a playlist left unnamed: from the prompt of the
   * project's first generation where there is one, else the editor and date.
   */
  defaultName: () => string | Promise<string>;
};

const timestampedName = (prefix: string) =>
  `${prefix} ${new Date().toISOString().slice(0, 10)}`;

/**
 * The prompt an image was generated from, read from its dream; undefined
 * for an upload, or when the dream can't be fetched.
 */
const dreamImagePrompt = async (dreamUuid?: string) => {
  if (!dreamUuid) return undefined;
  try {
    const origin = imageOriginFromDreamPrompt(
      (await fetchDream(dreamUuid))?.prompt,
    );
    return origin.kind === "generated" ? origin.prompt : undefined;
  } catch {
    return undefined;
  }
};

const flowSaveAdapter: EditorSaveAdapter = {
  pendingDreamUuids: () => [],
  link: (playlistUuid) =>
    useFlowStore.getState().linkSavedPlaylist(playlistUuid, []),
  defaultName: async () => {
    const { referenceFrames, transitions } = useFlowStore.getState();
    const framePrompts = await Promise.all(
      referenceFrames.map((frame) => dreamImagePrompt(frame.dreamUuid)),
    );
    return (
      nameFromPrompt(firstFlowPrompt(framePrompts, transitions)) ||
      timestampedName("Flow")
    );
  },
};

// useActionPlaylistSync fills the playlist once it is linked.
const actionSaveAdapter: EditorSaveAdapter = {
  pendingDreamUuids: () => [],
  link: (playlistUuid) =>
    useStudioStore.getState().setOutputPlaylistId(playlistUuid),
  defaultName: async () => {
    const { images, actions, jobs } = useStudioStore.getState();
    // Images added from the library, or from before images kept their
    // prompt, have it only on their dream.
    const withPrompts = await Promise.all(
      images.map(async (image) =>
        image.prompt
          ? image
          : { ...image, prompt: await dreamImagePrompt(image.uuid) },
      ),
    );
    return (
      nameFromPrompt(firstActionPrompt(withPrompts, actions, jobs)) ||
      timestampedName("Action")
    );
  },
};

const enhanceSaveAdapter: EditorSaveAdapter = {
  pendingDreamUuids: () => [],
  link: () => {},
  defaultName: () => timestampedName("Enhance"),
};

const deforumSaveAdapter: EditorSaveAdapter = {
  pendingDreamUuids: () =>
    deforumPlaylistDreams(useDeforumStore.getState().clips),
  // The dreams were just pushed by the save, so they start out synced.
  link: (playlistUuid) =>
    useDeforumStore
      .getState()
      .linkSavedPlaylist(
        playlistUuid,
        deforumPlaylistDreams(useDeforumStore.getState().clips),
      ),
  defaultName: () =>
    nameFromPrompt(firstDeforumPrompt(useDeforumStore.getState().clips)) ||
    timestampedName("Deforum"),
};

export const SAVE_ADAPTERS: Record<StudioMode, EditorSaveAdapter> = {
  flow: flowSaveAdapter,
  action: actionSaveAdapter,
  enhance: enhanceSaveAdapter,
  deforum: deforumSaveAdapter,
};
