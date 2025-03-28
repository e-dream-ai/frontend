import { useInfiniteQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { Dream } from "@/types/dream.types";
import { VoteType } from "@/types/vote.types";

export const USER_INFINITE_VOTED_DREAMS_QUERY_KEY =
  "getInfiniteUserVotedDreams";

type QueryFunctionParams = {
  take: number;
  skip: number;
  userUUID?: string;
  type?: VoteType;
};

const getInfiniteUserVotedDreams = ({
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
  userUUID?: string;
  type?: VoteType;
};

export const useInfiniteUserVotedDreams = ({ userUUID, type }: HookParams) => {
  const { user } = useAuth();
  const take = PAGINATION.TAKE;

  return useInfiniteQuery<
    ApiResponse<{ dreams: Dream[]; count: number }>,
    Error
  >(
    [USER_INFINITE_VOTED_DREAMS_QUERY_KEY, type, userUUID],

    ({ pageParam = 0 }) =>
      getInfiniteUserVotedDreams({
        take,
        skip: pageParam * take,
        userUUID,
        type,
      })(),
    {
      enabled: Boolean(user),
    },
  );
};
