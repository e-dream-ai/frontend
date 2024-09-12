import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { Role } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const ROLES_QUERY_KEY = "getRoles";

type QueryFunctionParams = {
  take: number;
  skip: number;
  search?: string;
};

const getRoles = ({ take, skip, search }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/user/roles`, {
        params: {
          take,
          skip,
          search,
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
};

export const useRoles = ({
  page = 0,
  search,
  take = PAGINATION.TAKE,
}: HookParams) => {
  take = Math.min(take, PAGINATION.TAKE);
  const skip = page * take;
  const { user } = useAuth();
  return useQuery<ApiResponse<{ roles: Role[]; count: number }>, Error>(
    [ROLES_QUERY_KEY, page, search, take],
    getRoles({ take, skip, search }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user),
    },
  );
};
