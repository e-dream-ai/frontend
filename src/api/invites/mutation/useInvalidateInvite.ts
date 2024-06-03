import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { Invite } from "@/types/invite.types";
import { INVITES_QUERY_KEY } from "../query/useInvites";

type MutateFunctionParams = {
  id: number;
};

export const INVALIDATE_INVITE_MUTATION_KEY = "invalidateInvite";

const invalidateInvite = ({ id }: MutateFunctionParams) => {
  return async () => {
    return axiosClient
      .put(`/invite/${id ?? ""}/invalidate`, undefined, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useInvalidateInvite = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ invite: Invite }>, Error>(
    invalidateInvite({ id }),
    {
      mutationKey: [INVALIDATE_INVITE_MUTATION_KEY],
      onSuccess: () => {
        // Invalidate and refetch the 'invites' query
        queryClient.invalidateQueries([INVITES_QUERY_KEY]);
      },
    },
  );
};
