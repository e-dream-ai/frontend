import Bugsnag from "@bugsnag/js";
import { useMutation } from "@tanstack/react-query";
import { createPlaylistRequest } from "@/api/playlist/mutation/useCreatePlaylist";
import { runPlaylistRequest } from "@/api/playlist/mutation/useRunPlaylist";
import {
  useAddPlaylistToCache,
  type PlaylistSummary,
} from "./useUserPlaylists";
import type {
  InterpolationFactor,
  UpscaleFactor,
} from "../constants/uprez-factor-options";
import { buildUprezPlaylistPrompt } from "../utils/uprez-playlist-prompt";

export const CREATE_UPREZ_PLAYLIST_MUTATION_KEY = "createUprezPlaylist";

export type CreateUprezPlaylistArgs = {
  name: string;
  sourcePlaylistUuid: string;
  upscaleFactor: UpscaleFactor;
  interpolationFactor: InterpolationFactor;
};

export type CreatedUprezPlaylist = {
  playlist: PlaylistSummary;
  runError: Error | null;
};

/** A run failure preserves the created playlist so it can be started again. */
export const useCreateUprezPlaylist = () => {
  const addPlaylistToCache = useAddPlaylistToCache();

  return useMutation<CreatedUprezPlaylist, Error, CreateUprezPlaylistArgs>({
    mutationKey: [CREATE_UPREZ_PLAYLIST_MUTATION_KEY],
    mutationFn: async ({ name, ...factors }) => {
      const created = await createPlaylistRequest({
        name,
        prompt: buildUprezPlaylistPrompt(factors),
      });

      const playlist = created.data?.playlist;
      if (!playlist) throw new Error("No playlist in create response");

      let runError: Error | null = null;
      try {
        await runPlaylistRequest(playlist.uuid);
      } catch (err) {
        runError =
          err instanceof Error
            ? err
            : new Error("Failed to start the uprez playlist");
        Bugsnag.notify(runError);
      }

      return {
        playlist: {
          uuid: playlist.uuid,
          name: playlist.name,
          thumbnail: playlist.thumbnail,
          prompt: playlist.prompt,
        },
        runError,
      };
    },
    onSuccess: ({ playlist }) => addPlaylistToCache(playlist),
  });
};
