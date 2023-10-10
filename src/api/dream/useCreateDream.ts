import { useMutation } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { getRequestHeaders } from "constants/auth.constants";
import { CREATE_DREAM_FORM } from "constants/dreams.constants";
import useAuth from "hooks/useAuth";
import { CreateDreamFormValues } from "schemas/create-dream.schema";
import { MutationResponse } from "types/api.types";
import { Dream } from "types/dream.types";

export const CREATE_DREAM_MUTATION_KEY = "createDream";

const createDream = ({ accessToken }: { accessToken?: string }) => {
  return async (params: CreateDreamFormValues) => {
    const formData = new FormData();

    formData.append(CREATE_DREAM_FORM.FILE, params.video);

    return fetch(`${URL}/dream`, {
      method: "post",
      body: formData,
      headers: getRequestHeaders({ accessToken, removeContentType: true }),
    }).then((res) => {
      return res.json();
    });
  };
};

export const useCreateDream = () => {
  const { user } = useAuth();
  return useMutation<
    MutationResponse<{ dream: Dream }>,
    Error,
    CreateDreamFormValues
  >(createDream({ accessToken: user?.token.AccessToken }), {
    mutationKey: [CREATE_DREAM_MUTATION_KEY],
  });
};
