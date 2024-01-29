import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const USER_QUERY_KEY = "getUser";

type QueryFunctionParams = {
  id?: string | number;
};

const getUser = ({ id }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/user/${id}`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

type HookParams = {
  id?: string | number;
};

export const useUser = ({ id }: HookParams) => {
  const { user } = useAuth();
  return useQuery<ApiResponse<{ user: Omit<User, "token"> }>, Error>(
    [USER_QUERY_KEY, id],
    getUser({ id }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user),
    },
  );
};
