import { useInfiniteQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import type { Dream } from "@/types/dream.types";
import type { PromptHistoryFilters } from "@/types/prompt-history.types";

export const PROMPT_HISTORY_QUERY_KEY = "getPromptHistory";

const TAKE = 50;

type PromptHistoryResponse = ApiResponse<{ dreams: Dream[]; count: number }>;

const fetchPage = (
  { search, algorithm, sort, distinct }: PromptHistoryFilters,
  skip: number,
  signal?: AbortSignal,
) =>
  axiosClient
    .get<PromptHistoryResponse>("/v1/user/me/prompt-history", {
      params: {
        take: TAKE,
        skip,
        sort,
        distinct,
        ...(search && { search }),
        ...(algorithm && { algorithm }),
      },
      headers: getRequestHeaders({ contentType: ContentType.json }),
      signal,
    })
    .then((res) => res.data);

export const usePromptHistory = (filters: PromptHistoryFilters) => {
  const { user } = useAuth();
  return useInfiniteQuery<PromptHistoryResponse, AxiosError>(
    [PROMPT_HISTORY_QUERY_KEY, filters],
    ({ pageParam = 0, signal }) => fetchPage(filters, pageParam * TAKE, signal),
    {
      enabled: Boolean(user),
      staleTime: 30_000,
      getNextPageParam: (lastPage, allPages) => {
        const total = lastPage.data?.count ?? 0;
        const loaded = allPages.reduce(
          (sum, page) => sum + (page.data?.dreams?.length ?? 0),
          0,
        );
        return loaded < total ? allPages.length : undefined;
      },
    },
  );
};
