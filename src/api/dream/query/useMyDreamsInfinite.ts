import { useInfiniteQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";
import { MY_DREAMS_QUERY_KEY } from "./useMyDreams";

type QueryFunctionParams = {
  take: number;
  skip: number;
  search?: string;
  mediaType?: "image" | "video";
  userUUID?: string;
};

const getMyDreams = ({
  take,
  skip,
  search,
  mediaType,
  userUUID,
}: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/dream/my-dreams`, {
        params: {
          take,
          skip,
          search,
          mediaType,
          userUUID,
        },
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

type HookParams = {
  search?: string;
  mediaType?: "image" | "video";
  userUUID?: string;
};

export const useMyDreamsInfinite = ({
  search,
  mediaType,
  userUUID,
}: HookParams = {}) => {
  const { user } = useAuth();
  const take = PAGINATION.TAKE;

  return useInfiniteQuery<
    ApiResponse<{ dreams: Dream[]; count: number }>,
    Error
  >(
    [MY_DREAMS_QUERY_KEY, "infinite", search, mediaType, userUUID],
    ({ pageParam = 0 }) =>
      getMyDreams({
        take,
        skip: pageParam * take,
        search: search?.trim() || undefined,
        mediaType,
        userUUID,
      })(),
    {
      enabled: Boolean(user),
      getNextPageParam: (lastPage, allPages) => {
        const totalItems = lastPage.data?.count ?? 0;
        const currentItemCount = allPages.reduce(
          (total, page) => total + (page?.data?.dreams?.length ?? 0),
          0,
        );
        return currentItemCount < totalItems ? allPages.length : undefined;
      },
    },
  );
};
