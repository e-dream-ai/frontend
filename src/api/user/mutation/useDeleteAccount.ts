import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";

export const DELETE_ACCOUNT_MUTATION_KEY = "deleteAccount";

export const DELETE_ACCOUNT_CONFIRMATION = "DELETE";

const deleteAccount = async (confirmation: string): Promise<void> => {
  await axiosClient.delete<void>("/v1/user/me", {
    data: { confirmation },
  });
};

export const useDeleteAccount = () =>
  useMutation<void, Error, string>(deleteAccount, {
    mutationKey: [DELETE_ACCOUNT_MUTATION_KEY],
    retry: false,
  });
