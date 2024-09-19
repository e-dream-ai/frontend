import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { ApiKey } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const APIKEY_QUERY_KEY = "getApiKey";

type QueryFunctionParams = {
  id?: string | number;
};

const getApiKey = ({ id }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/user/${id}/apikey`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

type HookParams = {
  id?: string | number;
};

export const useApiKey = ({ id }: HookParams) => {
  return useQuery<ApiResponse<{ apikey: ApiKey }>, Error>(
    [APIKEY_QUERY_KEY],
    getApiKey({ id }),
    {
      enabled: Boolean(id),
    },
  );
};
