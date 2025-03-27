import { useInfiniteQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";
import { RoleType } from "@/types/role.types";

export const USERS_INFINITE_QUERY_KEY = "getInfiniteUsers";

type QueryFunctionParams = {
  take: number;
  skip: number;
  search?: string;
  role?: RoleType;
};

const getInfiniteUsers = ({
  take,
  skip,
  search,
  role,
}: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/user`, {
        params: {
          take,
          skip,
          search,
          role,
        },
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

type HookParams = {
  page?: number;
  take?: number;
  search?: string;
  role?: RoleType;
};

export const useInfiniteUsers = ({
  search,
  take = PAGINATION.TAKE,
  role,
}: HookParams) => {
  take = PAGINATION.TAKE;
  const { user } = useAuth();
  return useInfiniteQuery<ApiResponse<{ users: User[]; count: number }>, Error>(
    [USERS_INFINITE_QUERY_KEY, search, role],
    ({ pageParam = 0 }) =>
      getInfiniteUsers({ take, skip: pageParam * take, search, role })(),
    {
      enabled: Boolean(user),
      getNextPageParam: (lastPage, allPages) => {
        const totalItems = lastPage.data?.count ?? 0;
        const currentItemCount = allPages.reduce(
          (total, page) => total + (page?.data?.users?.length ?? 0),
          0,
        );

        // Check if there are more items to load
        return currentItemCount < totalItems ? allPages.length : undefined;
      },
    },
  );
};
