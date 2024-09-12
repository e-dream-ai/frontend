import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { Feature } from "@/types/feature.types";

export const FEATURES_QUERY_KEY = "getFeatures";

const getFeatures = () => {
  return async () =>
    axiosClient
      .get(`/v1/feature`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

export const useFeatures = () => {
  return useQuery<ApiResponse<{ features: Feature[] }>, Error>(
    [FEATURES_QUERY_KEY],
    getFeatures(),
    {
      refetchOnWindowFocus: false,
    },
  );
};
