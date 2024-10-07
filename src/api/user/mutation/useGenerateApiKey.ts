import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { ApiKey } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const GENERATE_APIKEY_MUTATION_KEY = "generateApiKey";

const generateApiKey = ({ uuid }: { uuid?: string }) => {
  return async () => {
    return axiosClient
      .put(
        `/v1/user/${uuid}/apikey`,
        {},
        {
          headers: getRequestHeaders({
            contentType: ContentType.none,
          }),
        },
      )
      .then((res) => {
        return res.data;
      });
  };
};

type HookProps = {
  uuid?: string;
};

export const useGenerateApiKey = ({ uuid }: HookProps) => {
  return useMutation<ApiResponse<{ apikey: ApiKey }>, Error>(
    generateApiKey({ uuid }),
    {
      mutationKey: [GENERATE_APIKEY_MUTATION_KEY],
    },
  );
};
