import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { Invite } from "@/types/invite.types";
import { InviteRequestValues } from "@/schemas/invite.schema";
import { INVITES_QUERY_KEY } from "../query/useInvites";

export const CREATE_INVITE_MUTATION_KEY = "createInvite";

const createInvite = () => {
  return async (params: InviteRequestValues) => {
    return axiosClient
      .post(`/v1/invite`, params, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useCreateInvite = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ invite: Invite }>,
    Error,
    InviteRequestValues
  >(createInvite(), {
    mutationKey: [CREATE_INVITE_MUTATION_KEY],
    onSuccess: () => {
      // Invalidate and refetch the 'invites' query
      queryClient.invalidateQueries([INVITES_QUERY_KEY]);
    },
  });
};
