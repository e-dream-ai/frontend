import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { ApiKey } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const APIKEY_QUERY_KEY = "getApiKey";

type QueryFunctionParams = {
  uuid?: string;
};

const getApiKey = ({ uuid }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/user/${uuid}/apikey`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

type HookParams = {
  uuid?: string;
};

export const useApiKey = ({ uuid }: HookParams) => {
  return useQuery<ApiResponse<{ apikey: ApiKey }>, Error>(
    [APIKEY_QUERY_KEY],
    getApiKey({ uuid }),
    {
      enabled: Boolean(uuid),
    },
  );
};
