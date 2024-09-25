import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { MagicFormValues } from "@/schemas/magic.schema";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const MAGIC_MUTATION_KEY = "magic";

const magic = async (values: MagicFormValues) => {
  return axiosClient
    .post(`/v2/auth/magic`, values, {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    })
    .then((res) => {
      return res.data;
    });
};

export const useMagic = () => {
  return useMutation<ApiResponse<{ user: User }>, Error, MagicFormValues>(
    magic,
    {
      mutationKey: [MAGIC_MUTATION_KEY],
    },
  );
};

export default useMagic;
