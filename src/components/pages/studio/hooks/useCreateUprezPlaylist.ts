import { useCallback, useState } from "react";
import Bugsnag from "@bugsnag/js";
import { useCreatePlaylist } from "@/api/playlist/mutation/useCreatePlaylist";
import {
  useRunPlaylist,
  type RunPlaylistResult,
} from "@/api/playlist/mutation/useRunPlaylist";
import { buildUprezPlaylistPrompt } from "../utils/uprez-playlist-prompt";

export type CreateUprezPlaylistArgs = {
  name: string;
  sourcePlaylistUuid: string;
  upscaleFactor: number;
  interpolationFactor: number;
};

export type CreatedUprezPlaylist = {
  uuid: string;
  name: string;
  run: RunPlaylistResult | null;
  /** Set when the playlist was created but starting it failed. */
  runError: Error | null;
};

/**
 * Creates a derived uprez playlist and immediately starts it.
 *
 * Create and run are two calls, and only the first is undoable by the user —
 * a created-but-never-run playlist is an invisible orphan. So a failed run is
 * reported through `runError` on an otherwise successful result rather than
 * thrown, letting the caller tell the user the playlist exists and can be run
 * from its own page. A failed create still throws.
 */
export const useCreateUprezPlaylist = () => {
  const createPlaylist = useCreatePlaylist();
  const runPlaylist = useRunPlaylist();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAndRun = useCallback(
    async ({
      name,
      sourcePlaylistUuid,
      upscaleFactor,
      interpolationFactor,
    }: CreateUprezPlaylistArgs): Promise<CreatedUprezPlaylist> => {
      setIsSubmitting(true);
      try {
        const created = await createPlaylist.mutateAsync({
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
          const started = await runPlaylist.mutateAsync(playlist.uuid);
          run = started.data?.result ?? null;
        } catch (err) {
          runError = err as Error;
          Bugsnag.notify(runError);
        }

        return { uuid: playlist.uuid, name: playlist.name, run, runError };
      } finally {
        setIsSubmitting(false);
      }
    },
    [createPlaylist, runPlaylist],
  );

  return { createAndRun, isSubmitting };
};
