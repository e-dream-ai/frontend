import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { PAGINATION } from "constants/pagination.constants";
import useAuth from "hooks/useAuth";
import { ApiResponse } from "types/api.types";
import { User } from "types/auth.types";

export const USERS_QUERY_KEY = "getUsers";

type QueryFunctionParams = {
  take: number;
  skip: number;
  search?: string;
};

const getUsers = ({ take, skip, search }: QueryFunctionParams) => {
  return async () =>
    axios
      .get(`${URL}/user`, {
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

export const useUsers = ({
  page = 0,
  search,
  take = PAGINATION.TAKE,
}: HookParams) => {
  take = Math.min(take, PAGINATION.TAKE);
  const skip = page * take;
  const { user } = useAuth();
  return useQuery<ApiResponse<{ users: User[]; count: number }>, Error>(
    [USERS_QUERY_KEY, page, search, take],
    getUsers({ take, skip, search }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user),
    },
  );
};
