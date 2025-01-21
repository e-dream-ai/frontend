import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { Dream } from "@/types/dream.types";

export const CURRENT_DREAM_QUERY_KEY = "getCurrentDream";

const getCurrentDream = async () => {
  return axiosClient
    .get(`/v2/auth/dream/current`, {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    })
    .then((res) => {
      return res.data;
    });
};

export const useCurrentDream = () => {
  return useQuery<ApiResponse<{ dream: Dream }>, Error>(
    [CURRENT_DREAM_QUERY_KEY],
    getCurrentDream,
  );
};

export default useCurrentDream;
