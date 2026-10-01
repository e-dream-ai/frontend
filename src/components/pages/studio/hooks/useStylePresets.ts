import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import type { StylePreset } from "@/types/style-preset.types";
import type { ImageModel } from "@/types/studio.types";

export const STYLE_PRESETS_QUERY_KEY = "studioStylePresets";

const STALE_TIME = 5 * 60_000;

type StylePresetsResponse = ApiResponse<{ presets: StylePreset[] }>;

const fetchStylePresets = (model: ImageModel, signal?: AbortSignal) =>
  axiosClient
    .get<StylePresetsResponse>("/v1/style-presets", {
      params: { model },
      headers: getRequestHeaders({ contentType: ContentType.json }),
      signal,
    })
    .then((res) => res.data);

const selectPresets = (response: StylePresetsResponse) =>
  response.data?.presets ?? [];

export const useStylePresets = (model: ImageModel) => {
  const { user } = useAuth();
  return useQuery<StylePresetsResponse, AxiosError, StylePreset[]>(
    [STYLE_PRESETS_QUERY_KEY, model],
    ({ signal }) => fetchStylePresets(model, signal),
    {
      enabled: Boolean(user),
      select: selectPresets,
      staleTime: STALE_TIME,
    },
  );
};

export const usePrefetchStylePresets = () => {
  const queryClient = useQueryClient();
  return (model: ImageModel) =>
    queryClient.prefetchQuery(
      [STYLE_PRESETS_QUERY_KEY, model],
      ({ signal }) => fetchStylePresets(model, signal),
      { staleTime: STALE_TIME },
    );
};
