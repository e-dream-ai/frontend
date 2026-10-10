import { useEffect, useMemo, useRef } from "react";
import Bugsnag from "@bugsnag/js";
import { useShallow } from "zustand/react/shallow";
import { useQueryClient } from "@tanstack/react-query";
import { useDeforumStore } from "@/stores/deforum.store";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import { useDeletePlaylistItem } from "@/api/playlist/mutation/useDeletePlaylistItem";
import { useOrderPlaylist } from "@/api/playlist/mutation/useOrderPlaylist";
import {
  PLAYLIST_ITEMS_QUERY_KEY,
  fetchAllPlaylistItems,
} from "@/api/playlist/query/usePlaylistItems";
import { PLAYLIST_QUERY_KEY } from "@/api/playlist/query/usePlaylist";

const isConflict = (err: unknown): boolean =>
  (err as { response?: { status?: number } })?.response?.status === 409;

/** The dreams the playlist should hold: each clip's finished final render. */
export const deforumPlaylistDreams = (
  clips: ReturnType<typeof useDeforumStore.getState>["clips"],
): string[] =>
  clips
    .filter((clip) => clip.final?.status === "processed")
    .map((clip) => clip.final!.dreamUuid)
    .filter((uuid, i, all) => all.indexOf(uuid) === i);

/**
 * Keep the linked playlist in step with the clips: a new final render goes in,
 * the one it replaced comes out, and the order follows the clip list. Tests
 * never reach the playlist. Items this editor didn't put there are untouched.
 */
export function useDeforumPlaylistSync() {
  const queryClient = useQueryClient();
  const addPlaylistItem = useAddPlaylistItem();
  const deletePlaylistItem = useDeletePlaylistItem();
  const orderPlaylist = useOrderPlaylist();

  const { savedPlaylistUuid, clips, synced } = useDeforumStore(
    useShallow((s) => ({
      savedPlaylistUuid: s.savedPlaylistUuid,
      clips: s.clips,
      synced: s.syncedPlaylistDreamUuids,
    })),
  );

  const desired = useMemo(() => deforumPlaylistDreams(clips), [clips]);
  const desiredKey = desired.join(",");
  const syncedKey = synced.join(",");
  const syncing = useRef(false);

  useEffect(() => {
    if (!savedPlaylistUuid || desiredKey === syncedKey) return;
    if (syncing.current) return;
    syncing.current = true;

    (async () => {
      try {
        const desiredSet = new Set(desired);
        const stale = synced.filter((uuid) => !desiredSet.has(uuid));
        const itemsByDream = async () =>
          new Map(
            (await fetchAllPlaylistItems(savedPlaylistUuid))
              .filter((it) => it.dreamItem?.uuid)
              .map((it) => [it.dreamItem!.uuid, it]),
          );

        let items = await itemsByDream();
        for (const uuid of desired.filter((u) => !items.has(u))) {
          try {
            await addPlaylistItem.mutateAsync({
              playlistUUID: savedPlaylistUuid,
              values: { type: "dream", uuid },
            });
          } catch (err) {
            if (!isConflict(err)) Bugsnag.notify(err as Error);
          }
        }
        for (const uuid of stale) {
          const item = items.get(uuid);
          if (!item) continue;
          try {
            await deletePlaylistItem.mutateAsync({
              playlistUUID: savedPlaylistUuid,
              itemId: item.id,
            });
          } catch (err) {
            Bugsnag.notify(err as Error);
          }
        }

        // Reorder within the slots our items already occupy, so anything else
        // in the playlist keeps its place.
        items = await itemsByDream();
        const ours = desired
          .map((uuid) => items.get(uuid))
          .filter((it): it is NonNullable<typeof it> => Boolean(it));
        const slots = ours.map((it) => it.order).sort((a, b) => a - b);
        const order = ours.map((it, i) => ({ id: it.id, order: slots[i] }));
        if (order.some((o, i) => ours[i].order !== o.order)) {
          await orderPlaylist.mutateAsync({
            uuid: savedPlaylistUuid,
            values: { order },
            mode: "server-driven",
          });
        }

        queryClient.invalidateQueries([PLAYLIST_QUERY_KEY, savedPlaylistUuid]);
        queryClient.invalidateQueries([
          PLAYLIST_ITEMS_QUERY_KEY,
          savedPlaylistUuid,
        ]);
        useDeforumStore.getState().setPlaylistDreamsSynced(desired);
      } catch (err) {
        Bugsnag.notify(err as Error);
      } finally {
        syncing.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the uuid lists, not array identity
  }, [savedPlaylistUuid, desiredKey, syncedKey]);
}
