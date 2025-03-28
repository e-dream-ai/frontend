import { useInfiniteQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { FeedItem } from "@/types/feed.types";
import { axiosClient } from "@/client/axios.client";

export const RANKED_FEED_QUERY_KEY = "getRankedFeed";

type QueryFunctionParams = {
  take: number;
  skip: number;
};

const getRankedFeed = ({ take, skip }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/feed/ranked`, {
        params: {
          take,
          skip,
        },
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

export const useRankedFeed = () => {
  const take = PAGINATION.TAKE;
  const { user } = useAuth();
  return useInfiniteQuery<
    ApiResponse<{ feed: FeedItem[]; count: number }>,
    Error
  >(
    [RANKED_FEED_QUERY_KEY],
    ({ pageParam = 0 }) => getRankedFeed({ take, skip: pageParam * take })(),
    {
      enabled: Boolean(user),
      getNextPageParam: (lastPage, allPages) => {
        const totalItems = lastPage.data?.count ?? 0;
        const currentItemCount = allPages.reduce(
          (total, page) => total + (page?.data?.feed?.length ?? 0),
          0,
        );

        // Check if there are more items to load
        return currentItemCount < totalItems ? allPages.length : undefined;
      },
    },
  );
};
