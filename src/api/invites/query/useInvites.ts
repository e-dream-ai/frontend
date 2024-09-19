import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { Invite } from "@/types/invite.types";

export const INVITES_QUERY_KEY = "getInvites";

type QueryFunctionParams = {
  take: number;
  skip: number;
};

const getInvites = ({ take, skip }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/invite`, {
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

type HookParams = {
  page?: number;
};

export const useInvites = ({ page = 0 }: HookParams) => {
  const take = PAGINATION.TAKE;
  const skip = page * take;
  const { user } = useAuth();
  return useQuery<ApiResponse<{ invites: Invite[]; count: number }>, Error>(
    [INVITES_QUERY_KEY, page],
    getInvites({ take, skip }),
    {
      enabled: Boolean(user),
    },
  );
};
