import { useMutation } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { CREATE_DREAM_FORM } from "constants/dreams.constants";
import useAuth from "hooks/useAuth";
import { CreateDreamFormValues } from "schemas/create-dream.schema";
import { ApiResponse } from "types/api.types";
import { Dream } from "types/dream.types";

export const CREATE_DREAM_MUTATION_KEY = "createDream";

const createDream = ({ accessToken }: { accessToken?: string }) => {
  return async (params: CreateDreamFormValues) => {
    const formData = new FormData();

    formData.append(CREATE_DREAM_FORM.FILE, params?.video ?? "");

    return fetch(`${URL}/dream`, {
      method: "post",
      body: formData,
      headers: getRequestHeaders({
        accessToken,
        contentType: ContentType.none,
      }),
    }).then((res) => {
      return res.json();
    });
  };
};

export const useCreateDream = () => {
  const { user } = useAuth();
  const accessToken = user?.token.AccessToken;

  return useMutation<
    ApiResponse<{ dream: Dream }>,
    Error,
    CreateDreamFormValues
  >(createDream({ accessToken }), {
    mutationKey: [CREATE_DREAM_MUTATION_KEY],
  });
};
