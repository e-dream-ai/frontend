import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import type { ApiResponse } from "@/types/api.types";
import type { Dream } from "@/types/dream.types";

interface CreateDreamFromPromptParams {
  name: string;
  prompt: string;
  description?: string;
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
  return useMutation<
    ApiResponse<{ dream: Dream }>,
    Error,
    CreateDreamFromPromptParams
  >(createDreamFromPrompt, {
    mutationKey: ["createDreamFromPrompt"],
  });
};
