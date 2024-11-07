import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { faRotateRight, faUpload } from "@fortawesome/free-solid-svg-icons";
import {
  AnchorLink,
  Button,
  Checkbox,
  FileUploader,
  Row,
} from "@/components/shared";
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
import { useTheme } from "styled-components";
import { useForm } from "react-hook-form";
import {
  CreateDreamFormValues,
  CreateDreamSchema,
} from "@/schemas/dream.schema";
import { yupResolver } from "@hookform/resolvers/yup";

export const CreateDream: React.FC = () => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const theme = useTheme();
  const [video, setVideo] = useState<FileState>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDreamFormValues>({
    resolver: yupResolver(CreateDreamSchema),
  });

  const {
    isLoading,
    isFailed,
    isAborting,
    uploadProgress,
    retryUploadFailedParts,
    mutateAsync,
    reset,
  } = useUploadDreamVideo();

  const handleChange: HandleChangeFile = (files) => {
    if (files instanceof FileList) {
      return;
    } else {
      setVideo(getFileState(files));
    }
  };

  const onSubmit = async (formData: CreateDreamFormValues) => {
    try {
      await mutateAsync({ file: video?.fileBlob, nsfw: formData.nsfw });
    } catch (error) {
      toast.error(t("page.create.error_uploading_dream"));
    }
  };

  const handleCancelCreateDream = async () => {
    if (video && isLoading) {
      await reset();
    }
    setVideo(undefined);
    toast.success(
      `${t("page.create.multipart_dream_upload_cancelled_successfully")}`,
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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

        {isFailed && (
          <Row>
            <Text color={theme.colorDanger}>
              {t("page.create.retry_upload")}
            </Text>
          </Row>
        )}

        {isLoading && (
          <Row mt={1} justifyContent="space-between">
            <ProgressBar completed={uploadProgress} />
          </Row>
        )}

        <Row my={4} justifyContent="space-between">
          <Column>
            <Checkbox {...register("nsfw")} error={errors.nsfw?.message}>
              {t("page.create.nsfw_dream")}
            </Checkbox>
          </Column>
          <Column>
            <Checkbox {...register("ccaLicense")} error={errors.ccaLicense?.message}>
              {t("page.create.cca_license_dream")}
            </Checkbox>
          </Column>
          <Column>
            <Row>
              {Boolean(video) && (
                <Button
                  type="button"
                  mr={2}
                  isLoading={isAborting}
                  disabled={!video || isAborting}
                  onClick={handleCancelCreateDream}
                >
                  {t("page.create.cancel")}
                </Button>
              )}
              {!isFailed && (
                <Button
                  after={<FontAwesomeIcon icon={faUpload} />}
                  onClick={handleSubmit(onSubmit)}
                  isLoading={isLoading}
                  disabled={!video || isAborting || isLoading}
                >
                  {isLoading
                    ? t("page.create.creating")
                    : t("page.create.create")}
                </Button>
              )}
              {isFailed && (
                <Button
                  type="button"
                  after={<FontAwesomeIcon icon={faRotateRight} />}
                  onClick={retryUploadFailedParts}
                  isLoading={isLoading}
                  disabled={isAborting || isLoading}
                >
                  {t("page.create.retry")}
                </Button>
              )}
            </Row>
          </Column>
        </Row>
        <Row>
          <Text>
            {t("page.create.content_policy")} {""}
            <AnchorLink
              style={{ textDecoration: "underline" }}
              to={ROUTES.TERMS_OF_SERVICE}
            >
              {t("page.create.terms_of_service")}
            </AnchorLink>
            .
          </Text>
        </Row>
      </Column>
    </form>
  );
};
