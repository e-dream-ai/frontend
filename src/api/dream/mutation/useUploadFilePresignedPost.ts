import { useMutation } from "@tanstack/react-query";
import { PresignedPostRequest } from "@/types/dream.types";
import { FILE_FORM } from "@/constants/file.constants";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import axios from "axios";

export const UPLOAD_FILE_PRESIGNED_POST_MUTATION_KEY =
  "uploadFilePresignedPost";

type OnChangeUploadProgress = (progress: number) => void;

type UploadFilePresignedPostProps = {
  t: (value: string) => string;
  onChangeUploadProgress: OnChangeUploadProgress;
};

const uploadFilePresignedPost = ({
  t,
  onChangeUploadProgress,
}: UploadFilePresignedPostProps) => {
  return async (values: PresignedPostRequest) => {
    const fields = values?.params?.fields;
    const formData = new FormData();

    const toastId = toast(t("hooks.use_create_dream.upload_in_progress"), {
      progress: 0,
    });

    if (fields) {
      Object.keys(fields).forEach((key) => {
        formData.append(key, fields[key]);
      });
    }

    formData.append(FILE_FORM.FILE, values?.file ?? "");
    return axios
      .post(values?.params?.url ?? "", formData, {
        headers: getRequestHeaders({
          contentType: ContentType.multipart,
        }),
        onUploadProgress: (ev) => {
          const progress = ev.loaded / (ev?.total ?? 0);
          onChangeUploadProgress?.(Math.round(progress * 100));
          toast.update(toastId, {
            progress: progress,
            isLoading: true,
          });
        },
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useUploadFilePresignedPost = ({
  onChangeUploadProgress,
}: {
  onChangeUploadProgress: OnChangeUploadProgress;
}) => {
  const { t } = useTranslation();
  return useMutation<unknown, Error, PresignedPostRequest>(
    uploadFilePresignedPost({ t, onChangeUploadProgress }),
    {
      mutationKey: [UPLOAD_FILE_PRESIGNED_POST_MUTATION_KEY],
    },
  );
};
