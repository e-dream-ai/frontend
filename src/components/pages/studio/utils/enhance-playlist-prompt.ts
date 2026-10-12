import type {
  InterpolationFactor,
  UpscaleFactor,
} from "../constants/enhance-factor-options";
import type { EnhancePlaylistPrompt } from "@/types/playlist.types";

/**
 * The prompt the backend recognises as a runnable enhance playlist
 * (`isEnhancePlaylistPrompt` in backend/src/utils/playlist-prompt.util.ts).
 * Built in one place so the Enhance app and the flow's save-to-playlist modal
 * can't drift on the field names the run endpoint reads.
 */
export const buildEnhancePlaylistPrompt = ({
  sourcePlaylistUuid,
  upscaleFactor,
  interpolationFactor,
}: {
  sourcePlaylistUuid: string;
  upscaleFactor: UpscaleFactor;
  interpolationFactor: InterpolationFactor;
}): EnhancePlaylistPrompt => ({
  infinidream_algorithm: "enhance_playlist",
  source_playlist_uuid: sourcePlaylistUuid,
  dream_algorithm: "enhance",
  params: {
    upscale_factor: upscaleFactor,
    interpolation_factor: interpolationFactor,
  },
});

export const isNoOpEnhance = (
  upscaleFactor: UpscaleFactor,
  interpolationFactor: InterpolationFactor,
): boolean => upscaleFactor === 1 && interpolationFactor === 1;
