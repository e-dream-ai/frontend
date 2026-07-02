import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import type { ApiResponse } from "@/types/api.types";
import type { Dream } from "@/types/dream.types";
import { MY_DREAMS_QUERY_KEY } from "../query/useMyDreams";

interface CreateDreamFromPromptParams {
  name: string;
  prompt: string;
  description?: string;
  sourceUrl?: string;
  draft?: boolean;
}

const createDreamFromPrompt = async (
  params: CreateDreamFromPromptParams,
): Promise<ApiResponse<{ dream: Dream }>> => {
  const { data } = await axiosClient.post<ApiResponse<{ dream: Dream }>>(
    "/v1/dream",
    params,
    {
      headers: getRequestHeaders({ contentType: ContentType.json }),
    },
  );
  return data;
};

export const useCreateDreamFromPrompt = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ dream: Dream }>,
    Error,
    CreateDreamFromPromptParams
  >(createDreamFromPrompt, {
    mutationKey: ["createDreamFromPrompt"],
    onSuccess: () => {
      queryClient.invalidateQueries([MY_DREAMS_QUERY_KEY]);
    },
  });
};
