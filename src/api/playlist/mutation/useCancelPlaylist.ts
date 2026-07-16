import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";

export const CANCEL_PLAYLIST_MUTATION_KEY = "cancelPlaylist";

const cancelPlaylist = () => {
  return async (uuid: string) => {
    return axiosClient
      .post(
        `/v1/playlist/${uuid}/cancel`,
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

export const useCancelPlaylist = () => {
  return useMutation<
    ApiResponse<{ result: { cancelled: number } }>,
    Error,
    string
  >(cancelPlaylist(), {
    mutationKey: [CANCEL_PLAYLIST_MUTATION_KEY],
  });
};
