import { useCallback, useEffect, useRef } from "react";
import axios from "axios";
import Bugsnag from "@bugsnag/js";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import { useQueryClient } from "@tanstack/react-query";
import { useStudioStore } from "@/stores/studio.store";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import {
  ADD_PLAYLIST_ITEMS_BATCH_SIZE,
  useAddPlaylistItems,
} from "@/api/playlist/mutation/useAddPlaylistItems";
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
  studioDreamUuids,
} from "../utils/action-playlist-sync";

const SYNC_DELAY_MS = 500;
const RETRY_DELAY_MS = 5000;
const MAX_RETRIES = 3;
const SYNC_ERROR_TOAST_ID = "action-playlist-sync-error";

const statusOf = (err: unknown): number | undefined =>
  axios.isAxiosError(err) ? err.response?.status : undefined;

const isRetryable = (err: unknown): boolean => {
  if (!axios.isAxiosError(err)) return true;
  const status = err.response?.status;
  return status === undefined || status >= 500;
};

const isMissingOrDuplicate = (err: unknown): boolean => {
  const status = statusOf(err);
  return status === 404 || status === 409;
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Keeps the action app's output playlist matching the matrix: a clip goes in
 * when it finishes rendering, leaves when it is discarded or replaced, and the
 * clips sit in matrix order (rows of images, columns of actions).
 */
export function useActionPlaylistSync(enabled: boolean) {
  const queryClient = useQueryClient();
  const { mutateAsync: addItems } = useAddPlaylistItems();
  const { mutateAsync: addItem } = useAddPlaylistItem();
  const { mutateAsync: deleteItem } = useDeletePlaylistItem();
  const { mutateAsync: orderPlaylist } = useOrderPlaylist();

  const { playlistUuid, desiredKey, studioKey } = useStudioStore(
    useShallow((s) => ({
      playlistUuid: s.outputPlaylistId,
      desiredKey: matrixDreamUuids(s.images, s.actions, s.jobs).join(","),
      studioKey: studioDreamUuids(s.jobs, s.historyJobs).join(","),
    })),
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
    // Read the store now rather than the render's values, so a rerun sees
    // whatever changed while the last pass was in flight.
    const s = useStudioStore.getState();
    const playlistUUID = s.outputPlaylistId;
    if (!enabledRef.current || !playlistUUID) return;
    const desired = matrixDreamUuids(s.images, s.actions, s.jobs);
    const studioDreams = new Set(studioDreamUuids(s.jobs, s.historyJobs));

    let items = await fetchAllPlaylistItems(playlistUUID);
    const { add, remove } = planPlaylistChanges(items, desired, studioDreams);
    let staleCache = false;

    try {
      for (
        let offset = 0;
        offset < add.length;
        offset += ADD_PLAYLIST_ITEMS_BATCH_SIZE
      ) {
        const batch = add.slice(offset, offset + ADD_PLAYLIST_ITEMS_BATCH_SIZE);
        try {
          await addItems({
            playlistUUID,
            items: batch.map((uuid) => ({ type: "dream" as const, uuid })),
          });
        } catch (err) {
          if (!isMissingOrDuplicate(err)) throw err;
          for (const uuid of batch) {
            try {
              await addItem({ playlistUUID, values: { type: "dream", uuid } });
              staleCache = true;
            } catch (itemErr) {
              if (!isMissingOrDuplicate(itemErr)) throw itemErr;
              if (statusOf(itemErr) === 404) Bugsnag.notify(itemErr as Error);
            }
          }
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
    } finally {
      if (staleCache) {
        void queryClient.invalidateQueries([PLAYLIST_QUERY_KEY, playlistUUID]);
        void queryClient.invalidateQueries([
          PLAYLIST_ITEMS_QUERY_KEY,
          playlistUUID,
        ]);
      }
    }
  }, [queryClient, addItems, addItem, deleteItem, orderPlaylist]);

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
            toast.error("Could not update the output playlist.", {
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
  }, [enabled, playlistUuid, desiredKey, studioKey, runSync]);
}
