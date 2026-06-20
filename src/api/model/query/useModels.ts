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

export type ModelsResponse = ApiResponse<{ models: ModelCatalogEntry[] }>;

type HookParams<TData> = {
  mediaType?: "video" | "image";
  select?: (data: ModelsResponse) => TData;
};

export const useModels = <TData = ModelsResponse>({
  mediaType,
  select,
}: HookParams<TData> = {}) => {
  const { user } = useAuth();
  return useQuery<ModelsResponse, Error, TData>(
    [MODELS_QUERY_KEY, mediaType ?? "all"],
    getModels(mediaType),
    {
      enabled: Boolean(user),
      staleTime: Infinity,
      select,
    },
  );
};
