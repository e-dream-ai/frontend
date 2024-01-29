import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";

export const DREAMS_QUERY_KEY = "getDreams";

type QueryFunctionParams = {
  take: number;
  skip: number;
};

const getDreams = ({ take, skip }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/dream`, {
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

export const useDreams = ({ page = 0 }: HookParams) => {
  const take = PAGINATION.TAKE;
  const skip = page * take;
  const { user } = useAuth();
  return useQuery<ApiResponse<{ dreams: Dream[]; count: number }>, Error>(
    [DREAMS_QUERY_KEY, page],
    getDreams({ take, skip }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user),
    },
  );
};
