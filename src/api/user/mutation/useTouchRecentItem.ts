import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import type { RecentItem, RecentItemType } from "@/types/recent-item.types";
import {
  RECENT_ITEMS_QUERY_KEY,
  type RecentItemsResponse,
} from "../query/useRecentItems";
import { PROMPT_HISTORY_QUERY_KEY } from "../query/usePromptHistory";

export const TOUCH_RECENT_ITEM_MUTATION_KEY = "touchRecentItem";

type TouchRecentItemVariables = {
  type: RecentItemType;
  dreamUuid: string;
};

const touchRecentItem = ({ type, dreamUuid }: TouchRecentItemVariables) =>
  axiosClient
    .put<ApiResponse<{ item: RecentItem }>>(
      `/v1/user/me/recent-items/${type}/${dreamUuid}`,
      undefined,
      { headers: getRequestHeaders({ contentType: ContentType.json }) },
    )
    .then((res) => res.data);

export const useTouchRecentItem = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ item: RecentItem }>,
    AxiosError,
    TouchRecentItemVariables,
    { previous?: RecentItemsResponse }
  >(touchRecentItem, {
    mutationKey: [TOUCH_RECENT_ITEM_MUTATION_KEY],
    onMutate: async ({ type, dreamUuid }) => {
      const queryKey = [RECENT_ITEMS_QUERY_KEY, type];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<RecentItemsResponse>(queryKey);
      queryClient.setQueryData<RecentItemsResponse>(queryKey, (current) => ({
        ...current,
        data: {
          items: [
            { dreamUuid, lastUsedAt: new Date().toISOString() },
            ...(current?.data?.items ?? []).filter(
              (item) => item.dreamUuid !== dreamUuid,
            ),
          ],
        },
      }));
      return { previous };
    },
    onError: (_error, { type }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          [RECENT_ITEMS_QUERY_KEY, type],
          context.previous,
        );
      }
    },
    onSettled: (_data, _error, { type }) => {
      void queryClient.invalidateQueries({
        queryKey: [RECENT_ITEMS_QUERY_KEY, type],
      });
      if (type === "prompt") {
        void queryClient.invalidateQueries({
          queryKey: [PROMPT_HISTORY_QUERY_KEY],
        });
      }
    },
  });
};
