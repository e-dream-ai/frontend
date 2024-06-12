import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";
import { RoleType } from "@/types/role.types";

export const USERS_QUERY_KEY = "getUsers";

type QueryFunctionParams = {
  take: number;
  skip: number;
  search?: string;
  role?: RoleType;
};

const getUsers = ({ take, skip, search, role }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/user`, {
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

export const useUsers = ({
  page = 0,
  search,
  take = PAGINATION.TAKE,
  role,
}: HookParams) => {
  take = PAGINATION.TAKE;
  const skip = page * take;
  const { user } = useAuth();
  return useQuery<ApiResponse<{ users: User[]; count: number }>, Error>(
    [USERS_QUERY_KEY, page, search, take, role],
    getUsers({ take, skip, search, role }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user),
    },
  );
};
