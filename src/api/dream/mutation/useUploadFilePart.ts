import { useMutation } from "@tanstack/react-query";
import { MultipartUploadRequest } from "@/types/dream.types";
// import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import axios from "axios";

export const UPLOAD_FILE_PART_MUTATION_KEY = "uploadFilePart";

type OnChangeUploadPartProgress = (
  partNumber: number,
  progress: number,
  totalParts: number,
) => void;

type UploadFilePartProps = {
  t: (value: string) => string;
  onChangeUploadPartProgress: OnChangeUploadPartProgress;
};

const uploadFilePart = ({
  /* t,*/ onChangeUploadPartProgress,
}: UploadFilePartProps) => {
  return async (values: MultipartUploadRequest) => {
    const type = values?.filePart?.type;

    return axios
      .put(values?.presignedUrl ?? "", values?.filePart, {
        headers: {
          "Content-Type": type,
        },
        onUploadProgress: (ev) => {
          const partNumber = values.partNumber;
          const totalParts = values.totalParts;
          const progress = ev.loaded / (ev?.total ?? 0);
          onChangeUploadPartProgress?.(
            partNumber,
            Math.round(progress * 100),
            totalParts,
          );
        },
      })
      .then((res) => {
        return res.headers?.Etag;
      });
  };
};

/**
 * Uploads file part of multipart
 * @returns UseMutationResult
 */
export const useUploadFilePart = ({
  onChangeUploadPartProgress,
}: {
  onChangeUploadPartProgress: OnChangeUploadPartProgress;
}) => {
  const { t } = useTranslation();
  return useMutation<string, Error, MultipartUploadRequest>(
    uploadFilePart({ t, onChangeUploadPartProgress }),
    {
      mutationKey: [UPLOAD_FILE_PART_MUTATION_KEY],
    },
  );
};
