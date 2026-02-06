import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import { ApiResponse } from "@/types/api.types";

export type UnsubscribeMarketingRequest = {
  token: string;
};

export type UnsubscribeMarketingResponse = {
  status: "unsubscribed" | "already_unsubscribed";
};

export const UNSUBSCRIBE_MARKETING_MUTATION_KEY = "unsubscribeMarketing";

const unsubscribeMarketing = async (values: UnsubscribeMarketingRequest) => {
  return axiosClient
    .post(`/v1/marketing/unsubscribe`, values)
    .then((res) => res.data);
};

export const useUnsubscribeMarketing = () => {
  return useMutation<
    ApiResponse<UnsubscribeMarketingResponse>,
    Error,
    UnsubscribeMarketingRequest
  >(unsubscribeMarketing, {
    mutationKey: [UNSUBSCRIBE_MARKETING_MUTATION_KEY],
  });
};

export default useUnsubscribeMarketing;
