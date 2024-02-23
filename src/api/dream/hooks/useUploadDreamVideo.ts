import { useEffect, useState } from "react";
import { useGlobalMutationLoading } from "@/hooks/useGlobalMutationLoading";
import { toast, Id as ToastId } from "react-toastify";
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
import { CompletedPart } from "@/schemas/multipart-upload";

type OnSucess = (dream?: Dream) => void;

type AsyncMutationProps = (
  params?: { file?: File; dream?: Dream },
  callbacks?: { onSuccess?: OnSucess },
) => Promise<Dream | undefined>;

type UseUploadDreamVideoProps = {
  navigateToDream?: boolean;
  showUploadProgressToast?: boolean;
};

export const useUploadDreamVideo = ({
  navigateToDream = true,
  showUploadProgressToast = true,
}: UseUploadDreamVideoProps = {}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [partsProgress, setPartsProgress] = useState<object>({});
  /**
   * totalUploadProgress value between 1 and 100
   */
  const [totalUploadProgress, setTotalUploadProgress] = useState<number>(0);
  const [toastId, setToastId] = useState<ToastId | undefined>();

  const handleUploadPartProgress = (partNumber: number, progress: number) => {
    setPartsProgress((prevProgress) => ({
      ...prevProgress,
      [partNumber]: progress,
    }));
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

  /**
   * Function to reset states
   */

  const resetStates = (toastId?: ToastId) => {
    setTotalUploadProgress(0);
    setToastId(undefined);
    setIsLoading(false);
    if (toastId) {
      toast.done(toastId);
    }
  };

  /**
   * Calculates totalUploadProgress value
   */
  const calculateTotalProgress = (partsProgress: object) => {
    const allProgress = Object.values(partsProgress);
    const totalProgress =
      allProgress.length > 0
        ? allProgress.reduce((acc, cur) => acc + cur, 0) / allProgress.length
        : 0;
    const roundedTotalProgress = Math.round(totalProgress);
    setTotalUploadProgress(roundedTotalProgress);
  };

  const mutateAsync: AsyncMutationProps = async (
    { file, dream } = {},
    { onSuccess } = {},
  ) => {
    if (!file) {
      toast.error(t("page.create.error_creating_dream"));
    }

    setIsLoading(true);
    let newToastId: ToastId | undefined;
    if (showUploadProgressToast) {
      newToastId = toast(t("hooks.use_create_dream.upload_in_progress"), {
        progress: 0,
      });
      setToastId(newToastId);
    }

    const extension = getFileExtension(file);
    const name = getFileNameWithoutExtension(file);
    const partSize = MULTIPART_FILE_PART_SIZE;
    // calculate number of parts, set 1 as min
    const totalParts = Math.max(Math.ceil(file!.size / partSize), 1);

    try {
      const { data: multipartUpload } =
        await createMultipartUploadMutation.mutateAsync({
          name,
          extension,
          parts: totalParts,
          // If the mutation doesn't receive a dream, it'll be created on the server
          uuid: dream?.uuid,
        });

      if (!dream) {
        dream = multipartUpload?.dream;
      }

      const uuid = dream?.uuid;
      const urls = multipartUpload?.urls ?? [];
      const uploadId = multipartUpload?.uploadId;

      // prepare upload promises to send each part
      const uploadPromises: Array<Promise<string>> = urls.map(
        async (presignedUrl, index) => {
          const partNumber = index + 1;
          const start = (partNumber - 1) * partSize;
          const end = partNumber * partSize;
          const blob = file!.slice(start, end);

          const etag = await uploadFilePartMutation.mutateAsync({
            filePart: blob,
            presignedUrl,
            partNumber,
            totalParts,
          });

          return etag;
        },
      );

      // get parts etags
      const etags = await Promise.all(uploadPromises);
      // generate completed parts array
      const parts: Array<CompletedPart> = etags.map(
        (etag, index) =>
          ({
            ETag: etag,
            PartNumber: index + 1,
          }) as CompletedPart,
      );

      // complete multipart upload
      const completeMultipartUploadData =
        await completeMultipartUploadMutation.mutateAsync({
          uuid,
          name,
          extension,
          parts,
          uploadId: uploadId,
        });

      dream = completeMultipartUploadData?.data?.dream;
      toast.success(t("page.create.dream_successfully_uploaded"));
      onSuccess?.(dream);
      resetStates(newToastId);
      if (navigateToDream) {
        router.navigate(`${ROUTES.VIEW_DREAM}/${dream?.uuid}`);
      }
      return dream;
    } catch (error) {
      resetStates(newToastId);
      toast.error(t("page.create.error_uploading_dream"));
    }
  };

  /**
   * update toast with totalUploadProgress
   */
  useEffect(() => {
    if (toastId) {
      const progress = (totalUploadProgress / 100).toFixed(2);
      toast.update(toastId, {
        progress,
        isLoading: true,
      });
    }
  }, [toastId, totalUploadProgress]);

  useEffect(() => {
    calculateTotalProgress(partsProgress);
  }, [partsProgress]);

  return {
    isLoading: isAnyCreateDreamMutationLoading || isLoading,
    mutateAsync,
    uploadProgress: totalUploadProgress,
  };
};
