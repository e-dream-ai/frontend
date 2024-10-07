import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { ApiKey } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const REVOKE_APIKEY_MUTATION_KEY = "revokeApiKey";

const revokeApiKey = ({ uuid }: { uuid?: string }) => {
  return async () => {
    return axiosClient
      .delete(`/v1/user/${uuid}/apikey`, {
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
  uuid?: string;
};

export const useRevokeApiKey = ({ uuid }: HookProps) => {
  return useMutation<ApiResponse<{ apikey: ApiKey }>, Error>(
    revokeApiKey({ uuid }),
    {
      mutationKey: [REVOKE_APIKEY_MUTATION_KEY],
    },
  );
};
