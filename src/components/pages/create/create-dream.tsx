import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { AnchorLink, Button, FileUploader, Row } from "@/components/shared";
import ProgressBar from "@/components/shared/progress-bar/progress-bar";
import { HandleChangeFile } from "@/types/media.types";
import { Column } from "@/components/shared/row/row";
import Text from "@/components/shared/text/text";
import {
  getFileState,
  handleFileUploaderSizeError,
  handleFileUploaderTypeError,
} from "@/utils/file-uploader.util";
import {
  ALLOWED_VIDEO_TYPES,
  FileState,
  MAX_FILE_SIZE_MB,
} from "@/constants/file.constants";
import { ROUTES } from "@/constants/routes.constants";
import { Video } from "./create.styled";
import { useUploadDreamVideo } from "@/api/dream/hooks/useUploadDreamVideo";
import { toast } from "react-toastify";

export const CreateDream: React.FC = () => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const [video, setVideo] = useState<FileState>();

  const handleChange: HandleChangeFile = (files) => {
    if (files instanceof FileList) {
      return;
    } else {
      setVideo(getFileState(files));
    }
  };

  const { isLoading, isAborting, uploadProgress, mutateAsync, reset } =
    useUploadDreamVideo();

  const handleUploadDream = async () => {
    try {
      await mutateAsync({ file: video?.fileBlob });
    } catch (error) {
      toast.error(t("page.create.error_uploading_dream"));
    }
  };

  const handleCancelCreateDream = async () => {
    await reset();
    setVideo(undefined);
    toast.success(
      `${t("page.create.multipart_dream_upload_cancelled_successfully")}`,
    );
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
        <AnchorLink to={ROUTES.TERMS_OF_SERVICE}>
          {t("page.create.terms_of_service")}
        </AnchorLink>
      </Text>
      <Row mt={1} justifyContent="space-between">
        <Column pr={4} justifyContent="center" style={{ width: "100%" }}>
          {isLoading && <ProgressBar completed={uploadProgress} />}
        </Column>

        <Column>
          {!!video && (
            <Row>
              <Button
                mr={2}
                isLoading={isAborting}
                disabled={isAborting}
                onClick={handleCancelCreateDream}
              >
                {t("page.create.cancel")}
              </Button>
              <Button
                after={<FontAwesomeIcon icon={faUpload} />}
                onClick={handleUploadDream}
                isLoading={isLoading}
                disabled={!video || isAborting || isLoading}
              >
                {isLoading
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
