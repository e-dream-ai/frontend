import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";

export const RUN_PLAYLIST_MUTATION_KEY = "runPlaylist";

/** Counts from a run, or from a preview of one (useUprezRunPreview). */
export type RunPlaylistResult = {
  created: number;
  requeued: number;
  kept: number;
  reused: number;
  replaced: number;
  cancelled: number;
  removed: number;
  skipped: number;
  linked: number;
};

const runPlaylist = () => {
  return async (uuid: string) => {
    return axiosClient
      .post(
        `/v1/playlist/${uuid}/run`,
        {},
        {
          headers: getRequestHeaders({
            contentType: ContentType.json,
          }),
        },
      )
      .then((res) => {
        return res.data;
      });
  };
};

export const useRunPlaylist = () => {
  return useMutation<ApiResponse<{ result: RunPlaylistResult }>, Error, string>(
    runPlaylist(),
    {
      mutationKey: [RUN_PLAYLIST_MUTATION_KEY],
    },
  );
};
