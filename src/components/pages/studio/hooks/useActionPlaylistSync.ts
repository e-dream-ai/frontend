import { useEffect, useRef } from "react";
import Bugsnag from "@bugsnag/js";
import { useShallow } from "zustand/react/shallow";
import { useQueryClient } from "@tanstack/react-query";
import { useStudioStore } from "@/stores/studio.store";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import { useDeletePlaylistItem } from "@/api/playlist/mutation/useDeletePlaylistItem";
import { useOrderPlaylist } from "@/api/playlist/mutation/useOrderPlaylist";
import {
  PLAYLIST_ITEMS_QUERY_KEY,
  fetchAllPlaylistItems,
} from "@/api/playlist/query/usePlaylistItems";
import { PLAYLIST_QUERY_KEY } from "@/api/playlist/query/usePlaylist";
import {
  matrixDreamUuids,
  planPlaylistChanges,
  planPlaylistOrder,
} from "../utils/action-playlist-sync";

const isConflict = (err: unknown): boolean =>
  (err as { response?: { status?: number } })?.response?.status === 409;

/**
 * Keeps the action app's output playlist matching the matrix: a clip goes in
 * when it finishes rendering, leaves when it is discarded or replaced, and the
 * clips sit in matrix order (rows of images, columns of actions).
 */
export function useActionPlaylistSync(enabled: boolean) {
  const queryClient = useQueryClient();
  const { mutateAsync: addItem } = useAddPlaylistItem();
  const { mutateAsync: deleteItem } = useDeletePlaylistItem();
  const { mutateAsync: orderPlaylist } = useOrderPlaylist();

  const { playlistUuid, desiredKey, studioKey } = useStudioStore(
    useShallow((s) => ({
      playlistUuid: s.outputPlaylistId,
      desiredKey: matrixDreamUuids(s.images, s.actions, s.jobs).join(","),
      studioKey: [...s.jobs, ...s.historyJobs]
        .map((j) => j.dreamUuid)
        .join(","),
    })),
  );

  const isSyncingRef = useRef(false);
  const rerunRef = useRef(false);

  useEffect(() => {
    if (!enabled || !playlistUuid) return;
    if (isSyncingRef.current) {
      rerunRef.current = true;
      return;
    }
    isSyncingRef.current = true;

    const syncOnce = async () => {
      // Read the store now rather than the render's values, so a rerun sees
      // whatever changed while the last pass was in flight.
      const s = useStudioStore.getState();
      const playlistUuid = s.outputPlaylistId;
      if (!playlistUuid) return;
      const desired = matrixDreamUuids(s.images, s.actions, s.jobs);
      const studioDreams = new Set(
        [...s.jobs, ...s.historyJobs].map((j) => j.dreamUuid),
      );

      let items = await fetchAllPlaylistItems(playlistUuid);
      const { add, remove } = planPlaylistChanges(items, desired, studioDreams);
      let changed = false;

      for (const uuid of add) {
        try {
          await addItem({
            playlistUUID: playlistUuid,
            values: { type: "dream", uuid },
          });
          changed = true;
        } catch (err) {
          if (!isConflict(err)) Bugsnag.notify(err as Error);
        }
      }
      for (const item of remove) {
        try {
          await deleteItem({ playlistUUID: playlistUuid, itemId: item.id });
          changed = true;
        } catch (err) {
          Bugsnag.notify(err as Error);
        }
      }

      if (changed) items = await fetchAllPlaylistItems(playlistUuid);
      const order = planPlaylistOrder(items, desired);
      if (order) {
        await orderPlaylist({
          uuid: playlistUuid,
          values: { order },
          mode: "server-driven",
        });
        changed = true;
      }

      if (changed) {
        void queryClient.invalidateQueries([PLAYLIST_QUERY_KEY, playlistUuid]);
        void queryClient.invalidateQueries([
          PLAYLIST_ITEMS_QUERY_KEY,
          playlistUuid,
        ]);
      }
    };

    (async () => {
      try {
        do {
          rerunRef.current = false;
          await syncOnce();
        } while (rerunRef.current);
      } catch (err) {
        Bugsnag.notify(err as Error);
      } finally {
        isSyncingRef.current = false;
      }
    })();
    // The keys stand for the store values syncOnce reads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, playlistUuid, desiredKey, studioKey]);
}
