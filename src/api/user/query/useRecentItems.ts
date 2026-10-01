import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import type { RecentItem, RecentItemType } from "@/types/recent-item.types";

export const RECENT_ITEMS_QUERY_KEY = "getRecentItems";

const RECENT_ITEMS_TAKE = 200;

export type RecentItemsResponse = ApiResponse<{ items: RecentItem[] }>;

const fetchRecentItems = (type: RecentItemType, signal?: AbortSignal) =>
  axiosClient
    .get<RecentItemsResponse>("/v1/user/me/recent-items", {
      params: { type, take: RECENT_ITEMS_TAKE },
      headers: getRequestHeaders({ contentType: ContentType.json }),
      signal,
    })
    .then((res) => res.data);

const selectItems = (response: RecentItemsResponse) =>
  response.data?.items ?? [];

export const useRecentItems = (type: RecentItemType) => {
  const { user } = useAuth();
  return useQuery<RecentItemsResponse, AxiosError, RecentItem[]>(
    [RECENT_ITEMS_QUERY_KEY, type],
    ({ signal }) => fetchRecentItems(type, signal),
    {
      enabled: Boolean(user),
      select: selectItems,
      staleTime: 60_000,
    },
  );
};
