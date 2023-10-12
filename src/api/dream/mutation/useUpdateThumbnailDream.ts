import { useMutation } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { FILE_DREAM_FORM } from "constants/dreams.constants";
import useAuth from "hooks/useAuth";
import { FileDreamFormValues } from "schemas/file-dream.schema";
import { ApiResponse } from "types/api.types";
import { Dream } from "types/dream.types";

type MutateFunctionParams = {
  accessToken?: string;
  uuid?: string;
};

export const UPDATE_THUMBNAIL_DREAM_MUTATION_KEY = "updateThumbnailDream";

const updateThumbnailDream = ({ accessToken, uuid }: MutateFunctionParams) => {
  return async (params: FileDreamFormValues) => {
    const formData = new FormData();

    formData.append(FILE_DREAM_FORM.FILE, params?.file ?? "");

    return fetch(`${URL}/dream/${uuid}/thumbnail`, {
      method: "put",
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

export const useUpdateThumbnailDream = (uuid?: string) => {
  const { user } = useAuth();
  const accessToken = user?.token.AccessToken;

  return useMutation<ApiResponse<{ dream: Dream }>, Error, FileDreamFormValues>(
    updateThumbnailDream({ accessToken, uuid }),
    {
      mutationKey: [UPDATE_THUMBNAIL_DREAM_MUTATION_KEY],
    },
  );
};
