import { useCallback } from "react";
import Bugsnag from "@bugsnag/js";
import { useCreatePlaylist } from "@/api/playlist/mutation/useCreatePlaylist";
import {
  useRunPlaylist,
  type RunPlaylistResult,
} from "@/api/playlist/mutation/useRunPlaylist";
import type { PlaylistSummary } from "./useUserPlaylists";
import type {
  InterpolationFactor,
  UpscaleFactor,
} from "../constants/uprez-factor-options";
import { buildUprezPlaylistPrompt } from "../utils/uprez-playlist-prompt";

export type CreateUprezPlaylistArgs = {
  name: string;
  sourcePlaylistUuid: string;
  upscaleFactor: UpscaleFactor;
  interpolationFactor: InterpolationFactor;
};

export interface CreatedUprezPlaylist extends PlaylistSummary {
  run: RunPlaylistResult | null;
  runError: Error | null;
}

/** A run failure preserves the created playlist so it can be started again. */
export const useCreateUprezPlaylist = () => {
  const { mutateAsync: createPlaylist, isLoading: isCreating } =
    useCreatePlaylist();
  const { mutateAsync: runPlaylist, isLoading: isRunning } = useRunPlaylist();

  const createAndRun = useCallback(
    async ({
      name,
      sourcePlaylistUuid,
      upscaleFactor,
      interpolationFactor,
    }: CreateUprezPlaylistArgs): Promise<CreatedUprezPlaylist> => {
      const created = await createPlaylist({
        name,
        prompt: buildUprezPlaylistPrompt({
          sourcePlaylistUuid,
          upscaleFactor,
          interpolationFactor,
        }),
      });

      const playlist = created.data?.playlist;
      if (!playlist) throw new Error("No playlist in create response");

      let run: RunPlaylistResult | null = null;
      let runError: Error | null = null;
      try {
        const started = await runPlaylist(playlist.uuid);
        run = started.data?.result ?? null;
      } catch (err) {
        runError =
          err instanceof Error
            ? err
            : new Error("Failed to start the uprez playlist");
        Bugsnag.notify(runError);
      }

      return {
        uuid: playlist.uuid,
        name: playlist.name,
        thumbnail: playlist.thumbnail,
        prompt: playlist.prompt,
        run,
        runError,
      };
    },
    [createPlaylist, runPlaylist],
  );

  return { createAndRun, isSubmitting: isCreating || isRunning };
};
