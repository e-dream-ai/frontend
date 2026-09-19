import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import Bugsnag from "@bugsnag/js";
import { useCreatePlaylist } from "@/api/playlist/mutation/useCreatePlaylist";
import { useUpdatePlaylist } from "@/api/playlist/mutation/useUpdatePlaylist";
import {
  ADD_PLAYLIST_ITEMS_BATCH_SIZE,
  useAddPlaylistItems,
} from "@/api/playlist/mutation/useAddPlaylistItems";
import { fetchAllPlaylistItems } from "@/api/playlist/query/usePlaylistItems";
import type { EditorProjectPlaylistRef } from "@/types/editor-project.types";
import type { StudioMode } from "@/types/flow.types";
import { SAVE_ADAPTERS } from "../utils/save-adapters";

export type PlaylistSaveStatus = "idle" | "saving";

type Options = {
  mode: StudioMode;
  playlist: EditorProjectPlaylistRef | null;
  attachPlaylist: (next: EditorProjectPlaylistRef) => void | Promise<void>;
};

export const useEditorProjectPlaylist = ({
  mode,
  playlist,
  attachPlaylist,
}: Options) => {
  const adapter = SAVE_ADAPTERS[mode];
  const createPlaylist = useCreatePlaylist();
  const updatePlaylist = useUpdatePlaylist();
  const addPlaylistItems = useAddPlaylistItems();

  const [status, setStatus] = useState<PlaylistSaveStatus>("idle");
  const [pendingName, setPendingName] = useState("");
  const pendingNameRef = useRef("");

  const pushDreams = useCallback(
    async (playlistUuid: string) => {
      const wanted = adapter.pendingDreamUuids();
      if (wanted.length === 0) return;

      const existing = await fetchAllPlaylistItems(playlistUuid);
      const present = new Set(
        existing
          .map((item) => item.dreamItem?.uuid)
          .filter((uuid): uuid is string => Boolean(uuid)),
      );
      const dreamUuids = wanted.filter((uuid) => !present.has(uuid));

      for (
        let offset = 0;
        offset < dreamUuids.length;
        offset += ADD_PLAYLIST_ITEMS_BATCH_SIZE
      ) {
        const batch = dreamUuids.slice(
          offset,
          offset + ADD_PLAYLIST_ITEMS_BATCH_SIZE,
        );
        await addPlaylistItems.mutateAsync({
          playlistUUID: playlistUuid,
          items: batch.map((uuid) => ({ type: "dream" as const, uuid })),
        });
      }
    },
    [adapter, addPlaylistItems],
  );

  const createAndSave = useCallback(
    async (name: string) => {
      const trimmed = name.trim() || adapter.defaultName();

      setStatus("saving");
      let next;

      try {
        const created = await createPlaylist.mutateAsync({ name: trimmed });
        next = created.data?.playlist;
        if (!next) throw new Error("No playlist in create response");

        await attachPlaylist({ uuid: next.uuid, name: next.name });
        adapter.link(next.uuid);
        pendingNameRef.current = "";
        setPendingName("");
      } catch (error) {
        Bugsnag.notify(error as Error);
        toast.error("Could not create the playlist. Try again.");
        setStatus("idle");
        return;
      }

      try {
        await pushDreams(next.uuid);
        toast.success(`Saved to ${next.name}`);
      } catch (error) {
        Bugsnag.notify(error as Error);
        toast.error(`${next.name} was created, but adding the dreams failed.`);
      } finally {
        setStatus("idle");
      }
    },
    [adapter, attachPlaylist, createPlaylist, pushDreams],
  );

  const save = useCallback(async () => {
    if (!playlist) {
      await createAndSave(pendingNameRef.current);
      return;
    }

    setStatus("saving");
    try {
      await pushDreams(playlist.uuid);
      toast.success(`Saved to ${playlist.name}`);
    } catch (error) {
      Bugsnag.notify(error as Error);
      toast.error(`Could not add the dreams to ${playlist.name}. Try again.`);
    } finally {
      setStatus("idle");
    }
  }, [createAndSave, playlist, pushDreams]);

  const renamePlaylist = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!playlist || !trimmed || trimmed === playlist.name) return;

      const previous = playlist;
      void attachPlaylist({ uuid: playlist.uuid, name: trimmed });

      try {
        await updatePlaylist.mutateAsync({
          uuid: playlist.uuid,
          values: { name: trimmed },
        });
      } catch (error) {
        Bugsnag.notify(error as Error);
        toast.error(`Could not rename to "${trimmed}". Try again.`);
        void attachPlaylist(previous);
      }
    },
    [attachPlaylist, playlist, updatePlaylist],
  );

  const setName = useCallback(
    (next: string) => {
      if (playlist) {
        void renamePlaylist(next);
        return;
      }
      pendingNameRef.current = next;
      setPendingName(next);
    },
    [playlist, renamePlaylist],
  );

  return {
    status,
    name: playlist?.name ?? pendingName,
    setName,
    save,
  };
};
