import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { Keyframe } from "@/types/keyframe.types";
import { axiosClient } from "@/client/axios.client";
import { RoleType } from "@/types/role.types";

export const KEYFRAMES_QUERY_KEY = "getKeyframes";

type QueryFunctionParams = {
  take: number;
  skip: number;
  search?: string;
};

const getKeyframes = ({ take, skip, search }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/keyframe`, {
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
  role?: RoleType;
};

export const useKeyframes = ({
  page = 0,
  search,
  take = PAGINATION.TAKE,
}: HookParams) => {
  take = PAGINATION.TAKE;
  const skip = page * take;
  const { user } = useAuth();
  return useQuery<ApiResponse<{ keyframes: Keyframe[]; count: number }>, Error>(
    [KEYFRAMES_QUERY_KEY, page, search, take],
    getKeyframes({ take, skip, search }),
    {
      enabled: Boolean(user),
    },
  );
};
