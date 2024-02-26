import { useMutation } from "@tanstack/react-query";
import { CancelTokenSource } from "axios";
import { MultipartUploadRequest } from "@/types/dream.types";
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
  cancelTokenSource?: CancelTokenSource;
};

const uploadFilePart = ({
  onChangeUploadPartProgress,
  cancelTokenSource,
}: UploadFilePartProps) => {
  return async (values: MultipartUploadRequest) => {
    const type = values?.filePart?.type;

    return axios
      .put(values?.presignedUrl ?? "", values?.filePart, {
        headers: {
          "Content-Type": type,
        },
        cancelToken: cancelTokenSource?.token,
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
        const etag = res.headers?.etag;
        // Removes leading and trailing double quotes on header
        const cleanedEtag = etag?.replace(/^"|"$/g, "");
        return cleanedEtag;
      });
  };
};

/**
 * Uploads file part of multipart
 * @returns UseMutationResult
 */
export const useUploadFilePart = ({
  onChangeUploadPartProgress,
  cancelTokenSource,
}: {
  onChangeUploadPartProgress: OnChangeUploadPartProgress;
  cancelTokenSource?: CancelTokenSource;
}) => {
  const { t } = useTranslation();
  return useMutation<string, Error, MultipartUploadRequest>(
    uploadFilePart({ t, onChangeUploadPartProgress, cancelTokenSource }),
    {
      mutationKey: [UPLOAD_FILE_PART_MUTATION_KEY],
    },
  );
};
