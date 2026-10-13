import { useCallback, useEffect, useRef } from "react";
import axios from "axios";
import Bugsnag from "@bugsnag/js";
import { toast } from "react-toastify";
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
import {
  planPlaylistChanges,
  planPlaylistOrder,
} from "../utils/action-playlist-sync";
import { deforumPlaylistDreams } from "../utils/deforum-targets";

const SYNC_DELAY_MS = 500;
const RETRY_DELAY_MS = 5000;
const MAX_RETRIES = 3;
const SYNC_ERROR_TOAST_ID = "deforum-playlist-sync-error";

const statusOf = (err: unknown): number | undefined =>
  axios.isAxiosError(err) ? err.response?.status : undefined;

const isRetryable = (err: unknown): boolean => {
  if (!axios.isAxiosError(err)) return true;
  const status = err.response?.status;
  return status === undefined || status >= 500;
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Keep the linked playlist in step with the clips: a new final render goes in,
 * the one it replaced comes out, and the order follows the clip list. Tests
 * never reach the playlist. Items this editor didn't put there are untouched.
 */
export function useDeforumPlaylistSync(enabled: boolean) {
  const queryClient = useQueryClient();
  const { mutateAsync: addItem } = useAddPlaylistItem();
  const { mutateAsync: deleteItem } = useDeletePlaylistItem();
  const { mutateAsync: orderPlaylist } = useOrderPlaylist();

  const playlistUuid = useDeforumStore((s) => s.savedPlaylistUuid);
  const desiredKey = useDeforumStore((s) =>
    deforumPlaylistDreams(s.clips).join(","),
  );

  const enabledRef = useRef(enabled);
  const isSyncingRef = useRef(false);
  const rerunRef = useRef(false);

  useEffect(() => {
    enabledRef.current = enabled;
    return () => {
      enabledRef.current = false;
    };
  }, [enabled]);

  const syncOnce = useCallback(async () => {
    const s = useDeforumStore.getState();
    const playlistUUID = s.savedPlaylistUuid;
    if (!enabledRef.current || !playlistUUID) return;
    const desired = deforumPlaylistDreams(s.clips);
    const synced = s.syncedPlaylistDreamUuids;
    if (desired.join(",") === synced.join(",")) return;

    let items = await fetchAllPlaylistItems(playlistUUID);
    const { add, remove } = planPlaylistChanges(
      items,
      desired,
      new Set(synced),
    );
    let staleCache = false;

    try {
      for (const uuid of add) {
        try {
          await addItem({ playlistUUID, values: { type: "dream", uuid } });
          staleCache = true;
        } catch (err) {
          const status = statusOf(err);
          if (status !== 404 && status !== 409) throw err;
          if (status === 404) Bugsnag.notify(err as Error);
        }
      }

      for (const item of remove) {
        try {
          await deleteItem({ playlistUUID, itemId: item.id });
          staleCache = true;
        } catch (err) {
          if (statusOf(err) !== 404) throw err;
        }
      }

      if (add.length > 0 || remove.length > 0) {
        items = await fetchAllPlaylistItems(playlistUUID);
      }
      const order = planPlaylistOrder(items, desired);
      if (order) {
        staleCache = false;
        await orderPlaylist({
          uuid: playlistUUID,
          values: { order },
          mode: "server-driven",
        });
      }
      useDeforumStore.getState().setPlaylistDreamsSynced(desired);
    } finally {
      if (staleCache) {
        void queryClient.invalidateQueries([PLAYLIST_QUERY_KEY, playlistUUID]);
        void queryClient.invalidateQueries([
          PLAYLIST_ITEMS_QUERY_KEY,
          playlistUUID,
        ]);
      }
    }
  }, [queryClient, addItem, deleteItem, orderPlaylist]);

  const runSync = useCallback(async () => {
    if (isSyncingRef.current) {
      rerunRef.current = true;
      return;
    }
    isSyncingRef.current = true;
    let failures = 0;

    try {
      do {
        rerunRef.current = false;
        try {
          await syncOnce();
          failures = 0;
        } catch (err) {
          Bugsnag.notify(err as Error);
          failures += 1;
          if (!isRetryable(err) || failures > MAX_RETRIES) {
            toast.error("Could not update the playlist.", {
              toastId: SYNC_ERROR_TOAST_ID,
            });
            break;
          }
          await wait(RETRY_DELAY_MS * failures);
          rerunRef.current = true;
        }
      } while (rerunRef.current && enabledRef.current);
    } finally {
      isSyncingRef.current = false;
    }
  }, [syncOnce]);

  useEffect(() => {
    if (!enabled || !playlistUuid) return;
    const timer = setTimeout(() => void runSync(), SYNC_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled, playlistUuid, desiredKey, runSync]);
}
