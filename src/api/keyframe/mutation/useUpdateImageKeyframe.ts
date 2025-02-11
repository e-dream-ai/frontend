import axios from "axios";
import { useCompleteKeyframeImageMultipartUpload } from "./useCompleteKeyframeImageMultipartUpload";
import { useInitKeyframeImageMultipartUpload } from "./useInitKeyframeImageMultipartUpload";
import { useUploadMultipartFile } from "@/api/dream/hooks/useUploadMultipartFile";
import { getFileExtension } from "@/utils/file-uploader.util";

export const useUpdateImageKeyframe = () => {
  const cancelTokenSource = axios.CancelToken.source();

  const initKeyframeImageMutation = useInitKeyframeImageMultipartUpload({
    cancelTokenSource,
  });

  const {
    mutateAsync: uploadFile,
    uploadProgress,
    isLoading: isUploading,
  } = useUploadMultipartFile({
    cancelTokenSource,
  });

  const completeKeyframeImageMutation = useCompleteKeyframeImageMultipartUpload(
    {
      cancelTokenSource,
    },
  );

  const updateImageKeyframe = async (keyframeUUID: string, file: File) => {
    const extension = getFileExtension(file);

    const initResponse = await initKeyframeImageMutation.mutateAsync({
      uuid: keyframeUUID,
      values: { extension },
    });

    const uploadId = initResponse.data?.uploadId;
    const urls = initResponse.data?.urls ?? [];

    const parts = await uploadFile({
      urls,
      file,
    });

    return await completeKeyframeImageMutation.mutateAsync({
      uuid: keyframeUUID,
      values: {
        uploadId,
        extension,
        parts,
      },
    });
  };

  return {
    updateImageKeyframe,
    uploadProgress,
    isLoading:
      initKeyframeImageMutation.isLoading ||
      isUploading ||
      completeKeyframeImageMutation.isLoading,
    error:
      initKeyframeImageMutation.error || completeKeyframeImageMutation.error,
  };
};
