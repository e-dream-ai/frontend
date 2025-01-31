import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { Dream } from "@/types/dream.types";
import { VoteType } from "@/types/vote.types";

export const USER_VOTED_DREAMS_QUERY_KEY = "getUserVotedDreams";

type QueryFunctionParams = {
  take: number;
  skip: number;
  userUUID?: string;
  type?: VoteType;
};

const getUserVotedDreams = ({
  take,
  skip,
  userUUID,
  type,
}: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/user/${userUUID}/votes`, {
        params: {
          take,
          skip,
          type,
        },
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

type HookParams = {
  page?: number;
  userUUID?: string;
  type?: VoteType;
};

export const useUserVotedDreams = ({
  page = 0,
  userUUID,
  type,
}: HookParams) => {
  const { user } = useAuth();
  const take = PAGINATION.TAKE;
  const skip = page * take;

  return useQuery<ApiResponse<{ dreams: Dream[]; count: number }>, Error>(
    [USER_VOTED_DREAMS_QUERY_KEY, page, type],
    getUserVotedDreams({ take, skip, userUUID, type }),
    {
      enabled: Boolean(user),
    },
  );
};
