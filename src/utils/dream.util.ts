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

  console.log({ dream, playlistItemId });
  return dream;
};
