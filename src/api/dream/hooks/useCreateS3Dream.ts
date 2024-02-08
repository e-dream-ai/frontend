import { useState } from "react";
import { useCreatePresignedPost } from "@/api/dream/mutation/useCreatePresignedPost";
import { useUploadFilePresignedPost } from "@/api/dream/mutation/useUploadFilePresignedPost";
import { useConfirmPresignedPost } from "@/api/dream/mutation/useConfirmPresignedPost";
import { useGlobalMutationLoading } from "@/hooks/useGlobalMutationLoading";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Dream } from "@/types/dream.types";
import {
  getFileExtension,
  getFileNameWithoutExtension,
} from "@/utils/file-uploader.util";

type OnSucess = (dream?: Dream) => void;
type AsyncMutationProps = (
  params?: { file?: File },
  callbacks?: { onSuccess?: OnSucess },
) => Promise<Dream | undefined>;

export const useCreateS3Dream = () => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { t } = useTranslation();

  const handleUploadProgress = (value: number) => setUploadProgress(value);

  const createPresignedPostMutation = useCreatePresignedPost();
  const uploadFilePresignedPostMutation = useUploadFilePresignedPost({
    onChangeUploadProgress: handleUploadProgress,
  });
  const confirmPresignedPostMutation = useConfirmPresignedPost();

  const isAnyCreateDreamMutationLoading = useGlobalMutationLoading(
    // @ts-expect-error no valid issue
    createPresignedPostMutation,
    uploadFilePresignedPostMutation,
    confirmPresignedPostMutation,
  );

  const mutateAsync: AsyncMutationProps = async (
    { file } = {},
    { onSuccess } = {},
  ) => {
    try {
      const extension = getFileExtension(file);
      const name = getFileNameWithoutExtension(file);
      const { data: presignedPost } =
        await createPresignedPostMutation.mutateAsync({ name, extension });
      const uuid = presignedPost?.uuid;

      await uploadFilePresignedPostMutation.mutateAsync({
        params: presignedPost,
        file,
      });

      const confirmData = await confirmPresignedPostMutation.mutateAsync({
        uuid,
        name,
        extension,
      });
      const newDream = confirmData?.data?.dream;
      toast.success(t("page.create.dream_successfully_created"));
      onSuccess?.(newDream);
      setUploadProgress(0);
      return newDream;
    } catch (error) {
      toast.error(t("page.create.error_creating_dream"));
    }
  };

  return {
    isLoading: isAnyCreateDreamMutationLoading,
    mutateAsync,
    uploadProgress,
  };
};
