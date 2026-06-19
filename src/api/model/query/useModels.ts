import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { ModelCatalogEntry } from "@/types/model.types";

export const MODELS_QUERY_KEY = "getModels";

const getModels = (mediaType?: string) => {
  return async () =>
    axiosClient
      .get(`/v1/models`, {
        params: mediaType ? { mediaType } : undefined,
        headers: getRequestHeaders({ contentType: ContentType.json }),
      })
      .then((res) => res.data);
};

type HookParams = {
  mediaType?: "video" | "image";
};

export const useModels = ({ mediaType }: HookParams = {}) => {
  const { user } = useAuth();
  return useQuery<ApiResponse<{ models: ModelCatalogEntry[] }>, Error>(
    [MODELS_QUERY_KEY, mediaType ?? "all"],
    getModels(mediaType),
    {
      enabled: Boolean(user),
      staleTime: Infinity,
    },
  );
};
