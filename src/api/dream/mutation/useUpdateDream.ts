import { useMutation } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import useAuth from "hooks/useAuth";
import { UpdateDreamFormValues } from "schemas/update-dream.schema";
import { ApiResponse } from "types/api.types";
import { Dream } from "types/dream.types";

type MutateFunctionParams = {
  accessToken?: string;
  uuid?: string;
};

export const UPDATE_DREAM_MUTATION_KEY = "updateDream";

const updateDream = ({ accessToken, uuid }: MutateFunctionParams) => {
  return async (params: UpdateDreamFormValues) => {
    return fetch(`${URL}/dream/${uuid ?? ""}`, {
      method: "put",
      body: JSON.stringify(params),
      headers: getRequestHeaders({
        accessToken,
        contentType: ContentType.json,
      }),
    }).then((res) => {
      return res.json();
    });
  };
};

export const useUpdateDream = (uuid?: string) => {
  const { user } = useAuth();
  const accessToken = user?.token.AccessToken;

  return useMutation<
    ApiResponse<{ dream: Dream }>,
    Error,
    UpdateDreamFormValues
  >(updateDream({ accessToken, uuid }), {
    mutationKey: [UPDATE_DREAM_MUTATION_KEY],
  });
};
