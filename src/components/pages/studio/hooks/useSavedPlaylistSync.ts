import { useEffect, useRef } from "react";
import Bugsnag from "@bugsnag/js";
import { useShallow } from "zustand/react/shallow";
import { useQueryClient } from "@tanstack/react-query";
import { useFlowStore } from "@/stores/flow.store";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import { useDeletePlaylistItem } from "@/api/playlist/mutation/useDeletePlaylistItem";
import { useOrderPlaylist } from "@/api/playlist/mutation/useOrderPlaylist";
import {
  PLAYLIST_ITEMS_QUERY_KEY,
  fetchAllPlaylistItems,
} from "@/api/playlist/query/usePlaylistItems";
import { PLAYLIST_QUERY_KEY } from "@/api/playlist/query/usePlaylist";
import { PLAYLIST_KEYFRAMES_QUERY_KEY } from "@/api/playlist/query/usePlaylistKeyframes";
import { syncFlowPlaylistKeyframes } from "@/components/pages/studio/utils/flow-keyframes";

const PLAYLIST_PLAYBACK_ITEMS_QUERY_KEY = "getPlaylistPlaybackItems";

const isConflict = (err: unknown): boolean =>
  (err as { response?: { status?: number } })?.response?.status === 409;

export function useSavedPlaylistSync() {
  const queryClient = useQueryClient();
  const addPlaylistItem = useAddPlaylistItem();
  const deletePlaylistItem = useDeletePlaylistItem();
  const orderPlaylist = useOrderPlaylist();

  const {
    savedPlaylistUuid,
    keyframes,
    transitions,
    syncedPlaylistDreamUuids,
    setPlaylistDreamsSynced,
  } = useFlowStore(
    useShallow((s) => ({
      savedPlaylistUuid: s.savedPlaylistUuid,
      keyframes: s.keyframes,
      transitions: s.transitions,
      syncedPlaylistDreamUuids: s.syncedPlaylistDreamUuids,
      setPlaylistDreamsSynced: s.setPlaylistDreamsSynced,
    })),
  );

  const isSyncingRef = useRef(false);

  const desiredUuids = transitions
    .filter((t) => t.status === "processed" && t.dreamUuid)
    .map((t) => t.dreamUuid!)
    .filter((uuid, i, arr) => arr.indexOf(uuid) === i);

  const desiredKey = desiredUuids.join(",");
  const syncedKey = syncedPlaylistDreamUuids.join(",");
  const keyframeKey = keyframes
    .map((keyframe) => `${keyframe.id}:${keyframe.keyframeUuid ?? ""}`)
    .join(",");

  useEffect(() => {
    if (!savedPlaylistUuid) return;

    const desiredSet = new Set(desiredUuids);
    const staleUuids = syncedPlaylistDreamUuids.filter(
      (uuid) => !desiredSet.has(uuid),
    );
    if (desiredUuids.length === 0 && staleUuids.length === 0) return;
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;

    const fetchItems = () =>
      queryClient.fetchQuery(
        [PLAYLIST_PLAYBACK_ITEMS_QUERY_KEY, savedPlaylistUuid],
        () => fetchAllPlaylistItems(savedPlaylistUuid),
        { staleTime: 0 },
      );

    (async () => {
      try {
        let items = await fetchItems();
        const itemByUuid = () =>
          new Map(
            items
              .filter((it) => it.dreamItem?.uuid)
              .map((it) => [it.dreamItem!.uuid, it]),
          );

        let map = itemByUuid();
        const toAdd = desiredUuids.filter((uuid) => !map.has(uuid));
        let changed = false;
        for (const uuid of toAdd) {
          try {
            await addPlaylistItem.mutateAsync({
              playlistUUID: savedPlaylistUuid,
              values: { type: "dream", uuid },
            });
            changed = true;
          } catch (err) {
            if (!isConflict(err)) Bugsnag.notify(err as Error);
          }
        }

        for (const uuid of staleUuids) {
          const item = map.get(uuid);
          if (!item) continue;
          try {
            await deletePlaylistItem.mutateAsync({
              playlistUUID: savedPlaylistUuid,
              itemId: item.id,
            });
            changed = true;
          } catch (err) {
            Bugsnag.notify(err as Error);
          }
        }

        if (changed) {
          items = await fetchItems();
        }
        map = itemByUuid();

        const flowItems = desiredUuids
          .map((uuid) => map.get(uuid))
          .filter((it): it is NonNullable<typeof it> => Boolean(it));

        if (flowItems.length > 0) {
          const slots = flowItems.map((it) => it.order).sort((a, b) => a - b);
          const order = flowItems.map((it, i) => ({
            id: it.id,
            order: slots[i],
          }));
          const needsReorder = order.some(
            (o, i) => flowItems[i].order !== o.order,
          );
          if (needsReorder) {
            try {
              await orderPlaylist.mutateAsync({
                uuid: savedPlaylistUuid,
                values: { order },
                mode: "server-driven",
              });
              changed = true;
            } catch (err) {
              Bugsnag.notify(err as Error);
            }
          }
        }

        let keyframesSynced = false;
        if (flowItems.length > 0) {
          const currentDreamKeyframes = new Map(
            flowItems
              .filter((it) => it.dreamItem?.uuid)
              .map((it) => [
                it.dreamItem!.uuid,
                {
                  startKeyframe: it.dreamItem!.startKeyframe?.uuid,
                  endKeyframe: it.dreamItem!.endKeyframe?.uuid,
                },
              ]),
          );
          try {
            await syncFlowPlaylistKeyframes({
              playlistUuid: savedPlaylistUuid,
              keyframes,
              transitions: transitions.filter(
                (transition) =>
                  transition.status === "processed" && transition.dreamUuid,
              ),
              currentDreamKeyframes,
            });
            keyframesSynced = true;
          } catch (err) {
            Bugsnag.notify(err as Error);
          }
        }

        if (changed || keyframesSynced) {
          queryClient.invalidateQueries([
            PLAYLIST_QUERY_KEY,
            savedPlaylistUuid,
          ]);
          queryClient.invalidateQueries([
            PLAYLIST_ITEMS_QUERY_KEY,
            savedPlaylistUuid,
          ]);
          queryClient.invalidateQueries([
            PLAYLIST_KEYFRAMES_QUERY_KEY,
            savedPlaylistUuid,
          ]);
        }

        setPlaylistDreamsSynced(desiredUuids);
      } catch (err) {
        Bugsnag.notify(err as Error);
      } finally {
        isSyncingRef.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPlaylistUuid, desiredKey, syncedKey, keyframeKey]);
}
