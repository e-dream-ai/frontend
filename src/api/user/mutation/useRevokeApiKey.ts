import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { ApiKey } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const REVOKE_APIKEY_MUTATION_KEY = "revokeApiKey";

const generateApiKey = ({ id }: { id?: number }) => {
  return async () => {
    return axiosClient
      .delete(`/user/${id}/apikey`, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
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
    mutationKey: [REVOKE_APIKEY_MUTATION_KEY],
  });
};
