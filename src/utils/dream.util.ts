import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";

export const generateDreamOptimisticApiResponse = ({
  dream,
}: {
  dream?: Dream;
}): ApiResponse<{ dream?: Dream }> => {
  return { success: true, data: { dream } };
};

export const removePlaylistItemFromDream = ({
  dream,
  playlistItemId,
}: {
  dream?: Dream;
  playlistItemId?: number;
}): Dream | undefined => {
  if (dream?.playlistItems) {
    dream.playlistItems = dream.playlistItems.filter(
      (pi) => pi.id !== playlistItemId,
    );
  }
  return dream;
};

/**
 * Calculates the time in HH:MM:SS format based on the provided video frames, fps, and frame number.
 *
 * @param {number} videoFrames - The total number of frames in the video.
 * @param {number} FPS - The frames per second of the video.
 * @param {number} frameNumber - The current frame number.
 * @returns {string} - Time in HH:MM:SS format.
 */
export const calculateTimeFromFrames = ({
  frameNumber,
  videoFrames,
  fps,
}: {
  frameNumber?: number;
  videoFrames?: number;
  fps?: number;
}) => {
  if (!frameNumber || !videoFrames || !fps) {
    return "00:00:00";
  }

  // Calculate the current time in seconds
  const currentTimeSeconds = frameNumber / fps;

  // Convert the current time in seconds to hours, minutes, and seconds
  const hours = Math.floor(currentTimeSeconds / 3600);
  const minutes = Math.floor((currentTimeSeconds % 3600) / 60);
  const seconds = Math.floor(currentTimeSeconds % 60);

  // Format the time as HH:MM:SS
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
