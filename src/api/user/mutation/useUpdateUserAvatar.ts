import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { FILE_FORM } from "constants/file.constants";
import { FileFormValues } from "schemas/file.schema";
import { ApiResponse } from "types/api.types";
import { User } from "types/auth.types";

type MutateFunctionParams = {
  id?: number;
};

export const UPDATE_USER_AVATAR_MUTATION_KEY = "updateUserAvatar";

const updateUserAvatar = ({ id }: MutateFunctionParams) => {
  return async (params: FileFormValues) => {
    const formData = new FormData();

    formData.append(FILE_FORM.FILE, params?.file ?? "");

    return axios
      .put(`${URL}/user/${id}/avatar`, formData, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useUpdateUserAvatar = ({ id }: { id?: number }) => {
  return useMutation<ApiResponse<{ user: User }>, Error, FileFormValues>(
    updateUserAvatar({ id }),
    {
      mutationKey: [UPDATE_USER_AVATAR_MUTATION_KEY],
    },
  );
};
