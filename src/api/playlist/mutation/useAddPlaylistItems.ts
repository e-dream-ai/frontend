import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PLAYLIST_QUERY_KEY } from "@/api/playlist/query/usePlaylist";
import { PLAYLIST_ITEMS_QUERY_KEY } from "@/api/playlist/query/usePlaylistItems";
import { PLAYLIST_KEYFRAMES_QUERY_KEY } from "@/api/playlist/query/usePlaylistKeyframes";
import type { ApiResponse } from "@/types/api.types";

import type { AddPlaylistItemFormValues } from "@/schemas/add-playlist-item.schema";

export const ADD_PLAYLIST_ITEMS_MUTATION_KEY = "addPlaylistItems";

export const ADD_PLAYLIST_ITEMS_BATCH_SIZE = 500;

interface AddPlaylistItemsArgs {
  playlistUUID: string;
  items: AddPlaylistItemFormValues["values"][];
}

export const useAddPlaylistItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [ADD_PLAYLIST_ITEMS_MUTATION_KEY],
    mutationFn: async ({ playlistUUID, items }: AddPlaylistItemsArgs) => {
      const { data } = await axiosClient.post<ApiResponse<{ added: number }>>(
        `/v1/playlist/${playlistUUID}/items`,
        { items },
        { headers: getRequestHeaders({ contentType: ContentType.json }) },
      );
      if (!data.success || data.data?.added !== items.length) {
        throw new Error("Could not save all playlist items");
      }
      return data;
    },
    onSuccess: (_data, { playlistUUID }) => {
      void queryClient.invalidateQueries({
        queryKey: [PLAYLIST_QUERY_KEY, playlistUUID],
      });
      void queryClient.invalidateQueries({
        queryKey: [PLAYLIST_ITEMS_QUERY_KEY, playlistUUID],
      });
      void queryClient.invalidateQueries({
        queryKey: [PLAYLIST_KEYFRAMES_QUERY_KEY, playlistUUID],
      });
    },
  });
};
