import { useCallback, useMemo } from "react";
import Bugsnag from "@bugsnag/js";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useStudioStore } from "@/stores/studio.store";
import {
  fetchAllPlaylistItems,
  PLAYLIST_ITEMS_QUERY_KEY,
} from "@/api/playlist/query/usePlaylistItems";
import { useDeletePlaylistItem } from "@/api/playlist/mutation/useDeletePlaylistItem";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import type { StudioJob } from "@/types/studio.types";
import { comboKeyOf } from "../utils/batch-selectors";

interface PlaylistChange {
  remove?: readonly string[];
  add?: string;
}

export const useOutputPlaylistSync = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: deleteItem } = useDeletePlaylistItem();
  const { mutateAsync: addItem } = useAddPlaylistItem();

  const apply = useCallback(
    async (playlistId: string, { remove = [], add }: PlaylistChange) => {
      if (remove.length > 0) {
        const wanted = new Set(remove);
        const items = await fetchAllPlaylistItems(playlistId);
        for (const item of items) {
          const uuid = item.dreamItem?.uuid;
          if (!uuid || !wanted.has(uuid)) continue;
          await deleteItem({ playlistUUID: playlistId, itemId: item.id });
        }
      }
      if (add) {
        await addItem({
          playlistUUID: playlistId,
          values: { type: "dream", uuid: add },
        });
      }
    },
    [deleteItem, addItem],
  );

  const sync = useCallback(
    (playlistId: string, change: PlaylistChange) => {
      apply(playlistId, change)
        .catch((error) => {
          Bugsnag.notify(error as Error);
          toast.error("Could not update the output playlist. Try again.");
        })
        .finally(() => {
          void queryClient.invalidateQueries([
            PLAYLIST_ITEMS_QUERY_KEY,
            playlistId,
          ]);
        });
    },
    [apply, queryClient],
  );

  return useMemo(
    () => ({
      remove: (playlistId: string, dreamUuids: readonly string[]) =>
        sync(playlistId, { remove: dreamUuids }),
      replace: (playlistId: string, change: PlaylistChange) =>
        sync(playlistId, change),
    }),
    [sync],
  );
};

/**
 * Discards a clip that did not come out well: gone from the matrix, the
 * preview and the output playlist, and its cell back to empty and unchecked so
 * the next Generate does not simply make it again. A rendered clip is kept in
 * history, where it can be restored.
 */
export const useDiscardStudioClip = () => {
  const outputPlaylistId = useStudioStore((s) => s.outputPlaylistId);
  const playlist = useOutputPlaylistSync();

  return useCallback(
    (job: StudioJob) => {
      const store = useStudioStore.getState();
      const comboKey = comboKeyOf(job.imageId, job.actionId);
      store.archiveJob(job.dreamUuid);
      store.setComboExcluded(comboKey, true);
      if (store.rerenderCombos.has(comboKey)) {
        store.toggleComboRerender(comboKey);
      }
      if (outputPlaylistId) playlist.remove(outputPlaylistId, [job.dreamUuid]);
    },
    [outputPlaylistId, playlist],
  );
};

/**
 * Discards every clip of the matching cells, as the × on each would: out of
 * the matrix, the preview and the output playlist, rendered ones into history.
 * Clips still rendering are dropped; the playlist already holds them, since
 * they are added on submit.
 */
const useDiscardStudioClipsWhere = () => {
  const outputPlaylistId = useStudioStore((s) => s.outputPlaylistId);
  const playlist = useOutputPlaylistSync();

  return useCallback(
    (matches: (job: StudioJob) => boolean) => {
      const store = useStudioStore.getState();
      const discarded = store.jobs
        .filter((j) => j.jobType !== "uprez" && matches(j))
        .map((j) => j.dreamUuid);
      if (discarded.length === 0) return;
      store.archiveJobs(discarded);
      if (outputPlaylistId) playlist.remove(outputPlaylistId, discarded);
    },
    [outputPlaylistId, playlist],
  );
};

/** Removes an action, discarding the clips it rendered. */
export const useRemoveStudioAction = () => {
  const discardWhere = useDiscardStudioClipsWhere();
  return useCallback(
    (actionId: string) => {
      discardWhere((j) => j.actionId === actionId);
      useStudioStore.getState().removeAction(actionId);
    },
    [discardWhere],
  );
};

/** Removes a reference image, discarding the clips rendered from it. */
export const useRemoveStudioImage = () => {
  const discardWhere = useDiscardStudioClipsWhere();
  return useCallback(
    (imageUuid: string) => {
      discardWhere((j) => j.imageId === imageUuid);
      useStudioStore.getState().removeImage(imageUuid);
    },
    [discardWhere],
  );
};

/**
 * Puts a history clip back in its cell, the output playlist and the preview
 * rotation. Whatever the cell held goes the other way. Returns false when the
 * cell is still rendering and nothing was restored.
 */
export const useRestoreStudioClip = () => {
  const outputPlaylistId = useStudioStore((s) => s.outputPlaylistId);
  const playlist = useOutputPlaylistSync();

  return useCallback(
    (dreamUuid: string) => {
      const result = useStudioStore.getState().restoreJob(dreamUuid);
      if (!result) return false;
      if (outputPlaylistId) {
        playlist.replace(outputPlaylistId, {
          remove: result.displaced ? [result.displaced.dreamUuid] : [],
          add: result.restored.dreamUuid,
        });
      }
      return true;
    },
    [outputPlaylistId, playlist],
  );
};
