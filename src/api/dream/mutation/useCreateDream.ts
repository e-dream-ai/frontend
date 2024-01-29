import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { FILE_FORM } from "@/constants/file.constants";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FileFormValues } from "@/schemas/file.schema";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";

export const CREATE_DREAM_MUTATION_KEY = "createDream";

type CreateDreamProps = {
  t: (value: string) => string;
  onChangeUploadProgress: OnChangeUploadProgress;
};

type OnChangeUploadProgress = (progress: number) => void;

const createDream = ({ t, onChangeUploadProgress }: CreateDreamProps) => {
  return async (params: FileFormValues) => {
    const formData = new FormData();
    formData.append(FILE_FORM.FILE, params?.file ?? "");
    const toastId = toast(t("hooks.use_create_dream.upload_in_progress"), {
      progress: 0,
    });

    return axiosClient
      .post(`/dream`, formData, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
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
        toast.done(toastId);
        return res.data;
      });
  };
};

export const useCreateDream = ({
  onChangeUploadProgress,
}: {
  onChangeUploadProgress: OnChangeUploadProgress;
}) => {
  const { t } = useTranslation();
  return useMutation<ApiResponse<{ dream: Dream }>, Error, FileFormValues>(
    createDream({ t, onChangeUploadProgress }),
    {
      mutationKey: [CREATE_DREAM_MUTATION_KEY],
    },
  );
};
