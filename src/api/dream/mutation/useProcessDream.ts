import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";

type MutateFunctionParams = {
  uuid?: string;
};

export const PROCESS_DREAM_MUTATION_KEY = "processDream";

const processDream = ({ uuid }: MutateFunctionParams) => {
  return async () => {
    return axiosClient
      .post(
        `/dream/${uuid ?? ""}/process-dream`,
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

export const useProcessDream = (uuid?: string) => {
  return useMutation<ApiResponse<{ dream: Dream }>, Error>(
    processDream({ uuid }),
    {
      mutationKey: [PROCESS_DREAM_MUTATION_KEY],
    },
  );
};
