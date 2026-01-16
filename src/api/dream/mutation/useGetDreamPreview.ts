import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";

type MutateFunctionParams = {
  uuid?: string;
};

export const GET_DREAM_PREVIEW_MUTATION_KEY = "getDreamPreview";

const getDreamPreview = ({ uuid }: MutateFunctionParams) => {
  return async () => {
    return axiosClient
      .get(`/v1/dream/${uuid ?? ""}/preview`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useGetDreamPreview = (uuid?: string) => {
  return useMutation<
    ApiResponse<{
      preview_frame: string | null;
    }>,
    Error
  >(getDreamPreview({ uuid }), {
    mutationKey: [GET_DREAM_PREVIEW_MUTATION_KEY],
  });
};
