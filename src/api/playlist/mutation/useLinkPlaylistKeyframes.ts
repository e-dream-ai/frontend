import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { LinkPlaylistKeyframesFormValues } from "@/schemas/link-playlist-keyframes.schema";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";

export const LINK_PLAYLIST_KEYFRAMES_MUTATION_KEY = "linkPlaylistKeyframes";

const linkPlaylistKeyframes = () => {
  return async (data: LinkPlaylistKeyframesFormValues) => {
    const { uuid, values } = data;
    return axiosClient
      .post(`/v1/playlist/${uuid}/link-keyframes`, values, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useLinkPlaylistKeyframes = () => {
  return useMutation<
    ApiResponse<{ linkedDreams: number }>,
    Error,
    LinkPlaylistKeyframesFormValues
  >(linkPlaylistKeyframes(), {
    mutationKey: [LINK_PLAYLIST_KEYFRAMES_MUTATION_KEY],
  });
};
