import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { Feature } from "@/types/feature.types";
import { UpdateFeatureRequestValues } from "@/schemas/feature.schema";
import { FEATURES_QUERY_KEY } from "../query/useFeatures";

export const UPDATE_FEATURE_MUTATION_KEY = "updateFeature";

const updateFeature = () => {
  return async (values: UpdateFeatureRequestValues) => {
    return axiosClient
      .put(`/v1/feature`, values, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useUpdateFeature = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<{ feature: Feature }>,
    Error,
    UpdateFeatureRequestValues
  >(updateFeature(), {
    mutationKey: [UPDATE_FEATURE_MUTATION_KEY],
    onSuccess: () => {
      // Invalidate and refetch the 'invites' query
      queryClient.invalidateQueries([FEATURES_QUERY_KEY]);
    },
  });
};
