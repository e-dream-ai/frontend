import type { UprezPlaylistPrompt } from "@/types/playlist.types";

/**
 * The prompt the backend recognises as a runnable uprez playlist
 * (`isUprezPlaylistPrompt` in backend/src/utils/playlist-prompt.util.ts).
 * Built in one place so the Uprez app and the flow's save-to-playlist modal
 * can't drift on the field names the run endpoint reads.
 */
export const buildUprezPlaylistPrompt = ({
  sourcePlaylistUuid,
  upscaleFactor,
  interpolationFactor,
}: {
  sourcePlaylistUuid: string;
  upscaleFactor: number;
  interpolationFactor: number;
}): UprezPlaylistPrompt => ({
  infinidream_algorithm: "uprez_playlist",
  source_playlist_uuid: sourcePlaylistUuid,
  dream_algorithm: "uprez",
  params: {
    upscale_factor: upscaleFactor,
    interpolation_factor: interpolationFactor,
  },
});
