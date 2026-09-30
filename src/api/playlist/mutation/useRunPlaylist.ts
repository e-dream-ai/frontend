import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import type { RunPlaylistResult } from "@/types/playlist.types";
import { axiosClient } from "@/client/axios.client";

export const RUN_PLAYLIST_MUTATION_KEY = "runPlaylist";

export const runPlaylistRequest = async (
  uuid: string,
): Promise<ApiResponse<{ result: RunPlaylistResult }>> =>
  axiosClient
    .post(
      `/v1/playlist/${uuid}/run`,
      {},
      {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      },
    )
    .then((res) => res.data);

export const useRunPlaylist = () => {
  return useMutation<ApiResponse<{ result: RunPlaylistResult }>, Error, string>(
    runPlaylistRequest,
    {
      mutationKey: [RUN_PLAYLIST_MUTATION_KEY],
    },
  );
};
