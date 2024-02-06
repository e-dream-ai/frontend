import { useState } from "react";
import { useCreatePresignedPost } from "@/api/dream/mutation/useCreatePresignedPost";
import { useUploadFilePresignedPost } from "@/api/dream/mutation/useUploadFilePresignedPost";
import { useConfirmPresignedPost } from "@/api/dream/mutation/useConfirmPresignedPost";
import { useGlobalMutationLoading } from "@/hooks/useGlobalMutationLoading";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Dream } from "@/types/dream.types";

type OnSucess = (dream?: Dream) => void;
type AsyncMutationProps = (
  params?: { file?: Blob },
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
    createPresignedPostMutation,
    // @ts-expect-error no valid issue
    uploadFilePresignedPostMutation,
    confirmPresignedPostMutation,
  );

  const mutateAsync: AsyncMutationProps = async (
    { file } = {},
    { onSuccess } = {},
  ) => {
    try {
      const { data: presignedPost } =
        await createPresignedPostMutation.mutateAsync({});
      const uuid = presignedPost?.uuid;

      await uploadFilePresignedPostMutation.mutateAsync({
        params: presignedPost,
        file,
      });

      const confirmData = await confirmPresignedPostMutation.mutateAsync(uuid);
      const newDream = confirmData?.data?.dream;
      toast.success(t("page.create.dream_successfully_created"));
      onSuccess?.(newDream);
      setUploadProgress(0);
      return newDream;
    } catch (error) {
      toast.error(t("page.create.error_creating_dream"));
      console.log(error);
    }
  };

  return {
    isLoading: isAnyCreateDreamMutationLoading,
    mutateAsync,
    uploadProgress,
  };
};
