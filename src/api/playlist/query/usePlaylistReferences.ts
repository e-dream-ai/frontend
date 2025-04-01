import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { PlaylistItem } from "@/types/playlist.types";

export const PLAYLIST_REFERENCES_QUERY_KEY = "getPlaylistReferences";

type QueryFunctionParams = {
  uuid?: string;
};

const getPlaylistReferences = ({ uuid }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/playlist/${uuid}/references`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

export const usePlaylistReferences = (uuid?: string) => {
  const { user } = useAuth();
  return useQuery<
    ApiResponse<{ references: PlaylistItem[]; count: number }>,
    Error
  >([PLAYLIST_REFERENCES_QUERY_KEY, uuid], getPlaylistReferences({ uuid }), {
    enabled: Boolean(user) && Boolean(uuid),
  });
};
