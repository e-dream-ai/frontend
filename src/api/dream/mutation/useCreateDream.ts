import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { FILE_DREAM_FORM } from "constants/dreams.constants";
import useAuth from "hooks/useAuth";
import { FileDreamFormValues } from "schemas/file-dream.schema";
import { ApiResponse } from "types/api.types";
import { Dream } from "types/dream.types";

export const CREATE_DREAM_MUTATION_KEY = "createDream";

const createDream = ({ accessToken }: { accessToken?: string }) => {
  return async (params: FileDreamFormValues) => {
    const formData = new FormData();

    formData.append(FILE_DREAM_FORM.FILE, params?.file ?? "");

    return axios
      .post(`${URL}/dream`, formData, {
        method: "post",
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useCreateDream = () => {
  const { user } = useAuth();
  const accessToken = user?.token?.AccessToken;

  return useMutation<ApiResponse<{ dream: Dream }>, Error, FileDreamFormValues>(
    createDream({ accessToken }),
    {
      mutationKey: [CREATE_DREAM_MUTATION_KEY],
    },
  );
};
