import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { Dream } from "@/types/dream.types";

type MutateFunctionParams = {
  uuid?: string;
};

export type CancelDreamResponse = ApiResponse<{
  message: string;
  jobFound: boolean;
  runpodCancelled: boolean;
  statusRestored: boolean;
  dream: Dream;
}>;

export const CANCEL_DREAM_MUTATION_KEY = "cancelDream";

const cancelDream = ({ uuid }: MutateFunctionParams) => {
  return async () => {
    return axiosClient
      .post<CancelDreamResponse>(
        `/v1/dream/${uuid ?? ""}/cancel-job`,
        {},
        {
          headers: getRequestHeaders({
            contentType: ContentType.json,
          }),
        },
      )
      .then((res) => {
        return res.data;
      });
  };
};

export const useCancelDream = (uuid?: string) => {
  return useMutation<CancelDreamResponse, Error>(cancelDream({ uuid }), {
    mutationKey: [CANCEL_DREAM_MUTATION_KEY],
  });
};
