import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { ApiKey } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const GENERATE_APIKEY_MUTATION_KEY = "generateApiKey";

const generateApiKey = ({ id }: { id?: number }) => {
  return async () => {
    return axiosClient
      .put(
        `/user/${id}/apikey`,
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
  id?: number;
};

export const useGenerateApiKey = ({ id }: HookProps) => {
  return useMutation<
    ApiResponse<{ apikey: ApiKey }>,
    Error,
    ApiResponse<unknown>
  >(generateApiKey({ id }), {
    mutationKey: [GENERATE_APIKEY_MUTATION_KEY],
  });
};
