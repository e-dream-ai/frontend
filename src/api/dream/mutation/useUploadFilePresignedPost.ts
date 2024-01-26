import { useMutation } from "@tanstack/react-query";
import { PresignedPost } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";
import { FILE_FORM } from "@/constants/file.constants";
import { FileFormValues } from "@/schemas/file.schema";

export const UPLOAD_FILE_PRESIGNED_POST_MUTATION_KEY =
  "uploadFilePresignedPost";

type PresignedPostRequestValues = {
  params: PresignedPost;
  fileData: FileFormValues;
};

const uploadFilePresignedPost = () => {
  return async (values: PresignedPostRequestValues) => {
    const formData = new FormData();
    formData.append(FILE_FORM.FILE, values.fileData?.file ?? "");
    return axiosClient
      .post(values.params.url, values.params.fields, {})
      .then((res) => {
        console.log(res);
        return res.data;
      });
  };
};

export const useCreatePresignedPost = () => {
  return useMutation<unknown, Error, PresignedPostRequestValues>(
    uploadFilePresignedPost(),
    {
      mutationKey: [UPLOAD_FILE_PRESIGNED_POST_MUTATION_KEY],
    },
  );
};
