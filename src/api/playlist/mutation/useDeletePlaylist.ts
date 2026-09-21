import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { Playlist } from "@/types/playlist.types";
import { axiosClient } from "@/client/axios.client";
import { PLAYLIST_QUERY_KEY } from "@/api/playlist/query/usePlaylist";
import { PLAYLISTS_QUERY_KEY } from "@/api/playlist/query/usePlaylists";
import { editorProjectKeys } from "@/api/editor-project/editor-project.keys";

export const DELETE_PLAYLIST_MUTATION_KEY = "deletePlaylist";

const deletePlaylist = () => {
  return async (uuid: string) => {
    return axiosClient
      .delete(`/v1/playlist/${uuid}`, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ playlist: Playlist }>, Error, string>(
    deletePlaylist(),
    {
      mutationKey: [DELETE_PLAYLIST_MUTATION_KEY],
      onSuccess: (_data, uuid) => {
        queryClient.removeQueries({ queryKey: [PLAYLIST_QUERY_KEY, uuid] });
        void queryClient.invalidateQueries({ queryKey: [PLAYLISTS_QUERY_KEY] });
        void queryClient.invalidateQueries({
          queryKey: editorProjectKeys.all,
        });
      },
    },
  );
};
