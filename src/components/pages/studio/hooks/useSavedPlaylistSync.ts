import { useEffect, useRef } from "react";
import Bugsnag from "@bugsnag/js";
import { useShallow } from "zustand/react/shallow";
import { useQueryClient } from "@tanstack/react-query";
import { useFlowStore } from "@/stores/flow.store";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import { useLinkPlaylistKeyframes } from "@/api/playlist/mutation/useLinkPlaylistKeyframes";
import { PLAYLIST_QUERY_KEY } from "@/api/playlist/query/usePlaylist";
import { PLAYLIST_ITEMS_QUERY_KEY } from "@/api/playlist/query/usePlaylistItems";
import { PLAYLIST_KEYFRAMES_QUERY_KEY } from "@/api/playlist/query/usePlaylistKeyframes";

const isConflict = (err: unknown): boolean =>
  (err as { response?: { status?: number } })?.response?.status === 409;

export function useSavedPlaylistSync() {
  const queryClient = useQueryClient();
  const addPlaylistItem = useAddPlaylistItem();
  const linkPlaylistKeyframes = useLinkPlaylistKeyframes();

  const {
    savedPlaylistUuid,
    transitions,
    loop,
    syncedPlaylistDreamUuids,
    markPlaylistDreamsSynced,
  } = useFlowStore(
    useShallow((s) => ({
      savedPlaylistUuid: s.savedPlaylistUuid,
      transitions: s.transitions,
      loop: s.loop,
      syncedPlaylistDreamUuids: s.syncedPlaylistDreamUuids,
      markPlaylistDreamsSynced: s.markPlaylistDreamsSynced,
    })),
  );

  const isSyncingRef = useRef(false);

  const syncedSet = new Set(syncedPlaylistDreamUuids);
  const pendingUuids = transitions
    .filter(
      (t) =>
        t.status === "processed" && t.dreamUuid && !syncedSet.has(t.dreamUuid),
    )
    .map((t) => t.dreamUuid!)
    .filter((uuid, i, arr) => arr.indexOf(uuid) === i);

  const pendingKey = pendingUuids.join(",");

  useEffect(() => {
    if (!savedPlaylistUuid || pendingUuids.length === 0) return;
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;

    (async () => {
      const synced: string[] = [];
      try {
        for (const uuid of pendingUuids) {
          try {
            await addPlaylistItem.mutateAsync({
              playlistUUID: savedPlaylistUuid,
              values: { type: "dream", uuid },
            });
            synced.push(uuid);
          } catch (err) {
            if (isConflict(err)) synced.push(uuid);
            else Bugsnag.notify(err as Error);
          }
        }

        if (synced.length > 0) {
          try {
            await linkPlaylistKeyframes.mutateAsync({
              uuid: savedPlaylistUuid,
              values: { loop, clear: true },
            });
          } catch (err) {
            Bugsnag.notify(err as Error);
          }

          markPlaylistDreamsSynced(synced);
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
      } finally {
        isSyncingRef.current = false;
      }
    })();
  }, [savedPlaylistUuid, pendingKey, loop]);
}
