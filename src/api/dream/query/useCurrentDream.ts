import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { Dream } from "@/types/dream.types";
import useAuth from "@/hooks/useAuth";

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
  const { user } = useAuth();

  return useQuery<ApiResponse<{ dream: Dream }>, Error>(
    [CURRENT_DREAM_QUERY_KEY],
    getCurrentDream,
    {
      enabled: Boolean(user),
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  );
};

export default useCurrentDream;
