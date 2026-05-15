import { useInfiniteQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { Dream, DreamMediaType } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";

export const MY_IMAGE_DREAMS_QUERY_KEY = "getMyImageDreams";

const TAKE = 50;

const fetchPage = (skip: number, search?: string) =>
  axiosClient
    .get<ApiResponse<{ dreams: Dream[]; count: number }>>(
      "/v1/dream/my-dreams",
      {
        params: {
          take: TAKE,
          skip,
          mediaType: DreamMediaType.IMAGE,
          ...(search && { search }),
        },
        headers: getRequestHeaders({ contentType: ContentType.json }),
      },
    )
    .then((res) => res.data);

export const useMyImageDreams = (search?: string) => {
  const { user } = useAuth();
  return useInfiniteQuery<
    ApiResponse<{ dreams: Dream[]; count: number }>,
    Error
  >(
    [MY_IMAGE_DREAMS_QUERY_KEY, search],
    ({ pageParam = 0 }) => fetchPage(pageParam * TAKE, search),
    {
      enabled: Boolean(user),
      staleTime: 30_000,
      getNextPageParam: (lastPage, allPages) => {
        const total = lastPage.data?.count ?? 0;
        const loaded = allPages.reduce(
          (sum, p) => sum + (p.data?.dreams?.length ?? 0),
          0,
        );
        return loaded < total ? allPages.length : undefined;
      },
    },
  );
};
