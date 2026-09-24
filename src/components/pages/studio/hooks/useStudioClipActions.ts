import { useCallback } from "react";
import { useStudioStore, comboKeyOf } from "@/stores/studio.store";
import { axiosClient } from "@/client/axios.client";
import { fetchAllPlaylistItems } from "@/api/playlist/query/usePlaylistItems";
import type { StudioJob } from "@/types/studio.types";

/**
 * Takes a clip out of the output playlist. The API removes by playlist item
 * id, which the studio never kept, so it is looked up by dream uuid. The dream
 * itself stays on the account.
 */
export const removeFromOutputPlaylist = async (
  playlistId: string,
  dreamUuid: string,
) => {
  const items = await fetchAllPlaylistItems(playlistId);
  const item = items.find((i) => i.dreamItem?.uuid === dreamUuid);
  if (!item) return;
  await axiosClient.delete(`/v1/playlist/${playlistId}/remove-item/${item.id}`);
};

const addToOutputPlaylist = (playlistId: string, dreamUuid: string) =>
  axiosClient.put(`/v1/playlist/${playlistId}/add-item`, {
    type: "dream",
    uuid: dreamUuid,
  });

/**
 * Discards a clip that did not come out well: gone from the matrix, the
 * preview and the output playlist, and its cell back to empty and unchecked so
 * the next Generate does not simply make it again. A rendered clip is kept in
 * history, where it can be restored.
 */
export const useDiscardStudioClip = () => {
  const outputPlaylistId = useStudioStore((s) => s.outputPlaylistId);

  return useCallback(
    (job: StudioJob) => {
      const store = useStudioStore.getState();
      const comboKey = comboKeyOf(job.imageId, job.actionId);
      store.archiveJob(job.dreamUuid);
      store.setComboExcluded(comboKey, true);
      if (store.rerenderCombos.has(comboKey)) {
        store.toggleComboRerender(comboKey);
      }

      if (outputPlaylistId) {
        removeFromOutputPlaylist(outputPlaylistId, job.dreamUuid).catch(
          (error) =>
            console.error("Failed to remove clip from playlist:", error),
        );
      }
    },
    [outputPlaylistId],
  );
};

/**
 * Puts a history clip back in its cell, the output playlist and the preview
 * rotation. Whatever the cell held goes the other way. Returns false when the
 * cell is still rendering and nothing was restored.
 */
export const useRestoreStudioClip = () => {
  const outputPlaylistId = useStudioStore((s) => s.outputPlaylistId);

  return useCallback(
    (dreamUuid: string) => {
      const result = useStudioStore.getState().restoreJob(dreamUuid);
      if (!result) return false;

      if (outputPlaylistId) {
        const { restored, displaced } = result;
        (async () => {
          if (displaced) {
            await removeFromOutputPlaylist(
              outputPlaylistId,
              displaced.dreamUuid,
            );
          }
          await addToOutputPlaylist(outputPlaylistId, restored.dreamUuid);
        })().catch((error) =>
          console.error("Failed to update playlist on restore:", error),
        );
      }
      return true;
    },
    [outputPlaylistId],
  );
};
