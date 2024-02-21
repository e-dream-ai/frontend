import { useEffect, useState } from "react";
import { useGlobalMutationLoading } from "@/hooks/useGlobalMutationLoading";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Dream } from "@/types/dream.types";
import {
  getFileExtension,
  getFileNameWithoutExtension,
} from "@/utils/file-uploader.util";
import { useCreateMultipartUpload } from "../mutation/useCreateMultipartUpload";
import { useCompleteMultipartUpload } from "../mutation/useCompleteMultipartUpload";
import { useUploadFilePart } from "../mutation/useUploadFilePart";
import { MULTIPART_FILE_PART_SIZE } from "@/constants/modal.constants";
import router from "@/routes/router";
import { ROUTES } from "@/constants/routes.constants";

type OnSucess = (dream?: Dream) => void;
type AsyncMutationProps = (
  params?: { file?: File },
  callbacks?: { onSuccess?: OnSucess },
) => Promise<Dream | undefined>;

export const useCreateS3Dream = () => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [partsProgress, setPartsProgress] = useState<object>({});
  const [toastId, setToastId] = useState<number | string | undefined>();

  const handleUploadPartProgress = (
    partNumber: number,
    progress: number,
    totalParts: number,
  ) => {
    setPartsProgress((prevProgress) => ({
      ...prevProgress,
      [partNumber]: progress,
    }));

    // Calculate percentage average
    const totalProgress =
      Object.values(partsProgress).reduce((acc, current) => acc + current, 0) /
      totalParts;

    console.log({
      partsProgress,
      totalProgress,
      partNumber,
      progress,
      totalParts,
    });
    setUploadProgress(Math.round(totalProgress));
  };

  const { t } = useTranslation();

  const createMultipartUploadMutation = useCreateMultipartUpload();

  const uploadFilePartMutation = useUploadFilePart({
    onChangeUploadPartProgress: handleUploadPartProgress,
  });
  const completeMultipartUploadMutation = useCompleteMultipartUpload();

  const isAnyCreateDreamMutationLoading = useGlobalMutationLoading(
    // @ts-expect-error no valid issue
    createMultipartUploadMutation,
    uploadFilePartMutation,
    completeMultipartUploadMutation,
  );

  const mutateAsync: AsyncMutationProps = async (
    { file } = {},
    { onSuccess } = {},
  ) => {
    if (!file) {
      toast.error(t("page.create.error_creating_dream"));
    }

    const newToastId = toast(t("hooks.use_create_dream.upload_in_progress"), {
      progress: 0,
    });
    setToastId(newToastId);
    let dream: Dream | undefined;
    const extension = getFileExtension(file);
    const name = getFileNameWithoutExtension(file);
    const partSize = MULTIPART_FILE_PART_SIZE;
    const totalParts = Math.ceil(file!.size / partSize);

    try {
      const { data: presignedPost } =
        await createMultipartUploadMutation.mutateAsync({
          name,
          extension,
          parts: totalParts,
        });
      const uuid = presignedPost?.uuid;
      const urls = presignedPost?.urls ?? [];
      const uploadId = presignedPost?.uploadId;

      const uploadPromises: Array<Promise<string>> = urls.map(
        (presignedUrl, index) => {
          const partNumber = index + 1;
          const start = (partNumber - 1) * partSize;
          const end = partNumber * partSize;
          const blob = file!.slice(start, end);

          return uploadFilePartMutation.mutateAsync({
            filePart: blob,
            presignedUrl,
            partNumber,
            totalParts,
          });
        },
      );

      const etags = await Promise.all(uploadPromises);

      const confirmData = await completeMultipartUploadMutation.mutateAsync({
        uuid,
        name,
        extension,
        etags: etags,
        uploadId: uploadId,
      });

      dream = confirmData?.data?.dream;
      toast.success(t("page.create.dream_successfully_created"));
      onSuccess?.(dream);
      setUploadProgress(0);
      setToastId(undefined);
      router.navigate(`${ROUTES.VIEW_DREAM}/${dream?.uuid}`);
      return dream;
    } catch (error) {
      setUploadProgress(0);
      setToastId(undefined);
      toast.error(t("page.create.error_creating_dream"));
    }
  };

  useEffect(() => {
    if (toastId) {
      toast.update(toastId, {
        progress: uploadProgress,
        isLoading: true,
      });
    }
  }, [toastId, uploadProgress]);

  return {
    isLoading: isAnyCreateDreamMutationLoading,
    mutateAsync,
    uploadProgress,
  };
};
