import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import router from "@/routes/router";
import { Anchor, Button, FileUploader, Row } from "@/components/shared";
import ProgressBar from "@/components/shared/progress-bar/progress-bar";
import { HandleChangeFile } from "@/types/media.types";
import { Column } from "@/components/shared/row/row";
import Text from "@/components/shared/text/text";
import {
  handleFileUploaderSizeError,
  handleFileUploaderTypeError,
} from "@/utils/file-uploader.util";
import {
  ALLOWED_VIDEO_TYPES,
  FileState,
  MAX_FILE_SIZE_MB,
} from "@/constants/file.constants";
import { ROUTES } from "@/constants/routes.constants";
import { useCreatePresignedPost } from "@/api/dream/mutation/useCreatePresignedPost";
import { useUploadFilePresignedPost } from "@/api/dream/mutation/useUploadFilePresignedPost";
import { useConfirmPresignedPost } from "@/api/dream/mutation/useConfirmPresignedPost";
import { useGlobalMutationLoading } from "@/hooks/useGlobalMutationLoading";
import { PresignedPostRequest } from "@/types/dream.types";
import { Video } from "./create.styled";

export const CreateDream: React.FC = () => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const [video, setVideo] = useState<FileState>();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

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

  const handleChange: HandleChangeFile = (file) => {
    setVideo({ fileBlob: file, url: URL.createObjectURL(file as Blob) });
  };

  const handleCancelCreateDream = () => setVideo(undefined);

  const handleUploadDream = async () => {
    createPresignedPostMutation.mutate(
      {},
      {
        onSuccess: (data) => {
          const presignedPost = data?.data;
          if (data.success) {
            handleUploadVideoDream({
              params: presignedPost,
              file: video?.fileBlob as Blob,
            });
          } else {
            toast.error(
              `${t("page.create.error_creating_dream")} ${data.message}`,
            );
          }
        },
        onError: () => {
          toast.error(t("page.create.error_creating_dream"));
        },
      },
    );
  };

  const handleUploadVideoDream = (presignedPost: PresignedPostRequest) => {
    const uuid = presignedPost?.params?.uuid;
    uploadFilePresignedPostMutation.mutate(presignedPost, {
      onSuccess: () => {
        handleConfirmUploadDream(uuid);
      },
      onError: () => {
        toast.error(t("page.create.error_creating_dream"));
      },
    });
  };

  const handleConfirmUploadDream = (uuid?: string) => {
    confirmPresignedPostMutation.mutate(uuid, {
      onSuccess: (data) => {
        const dream = data?.data?.dream;
        if (data.success) {
          toast.success(t("page.create.dream_successfully_created"));
          router.navigate(`${ROUTES.VIEW_DREAM}/${dream?.uuid}`);
        } else {
          toast.error(
            `${t("page.create.error_creating_dream")} ${data.message}`,
          );
        }
      },
      onError: () => {
        toast.error(t("page.create.error_creating_dream"));
      },
    });
  };

  return (
    <Column>
      {video ? (
        <>
          <Text my={3}>{t("page.create.dream_preview")}</Text>
          <Video ref={videoRef} id="dream" controls src={video?.url ?? ""} />
        </>
      ) : (
        <>
          <Text my={3}>{t("page.create.dream_instructions")}</Text>
          <FileUploader
            maxSize={MAX_FILE_SIZE_MB}
            handleChange={handleChange}
            onSizeError={handleFileUploaderSizeError(t)}
            onTypeError={handleFileUploaderTypeError(t)}
            name="file"
            types={ALLOWED_VIDEO_TYPES}
          />
        </>
      )}

      <Text my={4}>
        {t("page.create.content_policy")} {""}
        <Anchor href={ROUTES.TERMS_OF_SERVICE}>
          {t("page.create.terms_of_service")}
        </Anchor>
      </Text>
      <Row mt={1} justifyContent="space-between">
        <Column pr={4} justifyContent="center" style={{ width: "100%" }}>
          {isAnyCreateDreamMutationLoading && (
            <ProgressBar completed={uploadProgress} />
          )}
        </Column>

        <Column>
          {!!video && (
            <Row>
              <Button
                mr={2}
                disabled={isAnyCreateDreamMutationLoading}
                onClick={handleCancelCreateDream}
              >
                {t("page.create.cancel")}
              </Button>
              <Button
                after={<FontAwesomeIcon icon={faUpload} />}
                onClick={handleUploadDream}
                isLoading={isAnyCreateDreamMutationLoading}
                disabled={!video}
              >
                {isAnyCreateDreamMutationLoading
                  ? t("page.create.creating")
                  : t("page.create.create")}
              </Button>
            </Row>
          )}
        </Column>
      </Row>
    </Column>
  );
};
