import { Anchor } from "@/components/shared";
import { useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import {
  faComment,
  faLink,
  faRotateRight,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import {
  AnchorLink,
  Button,
  Checkbox,
  FileUploader,
  Input,
  Row,
  TextArea,
} from "@/components/shared";
import ProgressBar from "@/components/shared/progress-bar/progress-bar";
import { HandleChangeFile } from "@/types/media.types";
import { Column } from "@/components/shared/row/row";
import Text from "@/components/shared/text/text";
import {
  generateFileState,
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
import { generateDreamVideoFormRequest, useUploadDreamVideo } from "@/api/dream/hooks/useUploadDreamVideo";
import { toast } from "react-toastify";
import { useTheme } from "styled-components";
import { useForm } from "react-hook-form";
import {
  CreateDreamFormValues,
  CreateDreamSchema,
} from "@/schemas/dream.schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Tooltip } from "react-tooltip";
import { CCBY_ID } from "@/constants/terms-of-service";
import Restricted from "@/components/shared/restricted/restricted";
import { DREAM_PERMISSIONS } from "@/constants/permissions.constants";
import useAuth from "@/hooks/useAuth";
import { isAdmin } from "@/utils/user.util";
import { User } from "@/types/auth.types";

export const CreateDream: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
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
      setVideo(generateFileState(files));
    }
  };

  const onSubmit = async (data: CreateDreamFormValues) => {
    try {
      await mutateAsync(generateDreamVideoFormRequest(data, video?.fileBlob, isUserAdmin));
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
      <Column my={2}>
        {video ? (
          <>
            <Text my={3}>{t("page.create.dream_preview")}</Text>
            <Video ref={videoRef} id="dream" controls src={video?.url ?? ""} />
          </>
        ) : (
          <>
            <Text my={3}>{t("page.create.dream_instructions")}</Text>
	    <Text my={3}>
	      See the {" "}<Anchor href="https://docs.google.com/document/u/1/d/e/2PACX-1vTQnJMCLOqenrCADZyrXxgBTahQ4sPyRRj7GrhMEu_DkmScRRGOjRJQmd2rkH1-_K0WRjfGYd04rhJB/pub">Creators' Guide</Anchor> and
	      {" "}<Anchor href="https://github.com/e-dream-ai/python-api">Python API</Anchor> for more ways to make and share dreams.
	    </Text>
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
          <>
            <ProgressBar completed={uploadProgress} />
          </>
        )}

        <Row my={3}>
          <Column flex="auto">
            <Checkbox {...register("nsfw")} error={errors.nsfw?.message}>
              {t("page.create.nsfw_dream")}
            </Checkbox>
            <Restricted to={DREAM_PERMISSIONS.CAN_EDIT_VISIBILITY}>
              <Checkbox {...register("hidden")} error={errors.hidden?.message}>
                {t("page.create.hidden_dream")}
              </Checkbox>
            </Restricted>
            <div data-tooltip-id="ccby-license">
              <Checkbox
                {...register("ccbyLicense")}
                error={errors.ccbyLicense?.message}
              >
                <Tooltip
                  id="ccby-license"
                  place="right-end"
                  content={t("page.create.ccby_license_dream_tooltip")}
                />
                {t("page.create.license_dream")}
                {" "}
                <AnchorLink to={`${ROUTES.TERMS_OF_SERVICE}#${CCBY_ID}`}>
                  {t("page.create.license_dream_ccby")}
                </AnchorLink>
              </Checkbox>
            </div>

            <TextArea
              placeholder={t("page.create.dream_description")}
              before={<FontAwesomeIcon icon={faComment} />}
              error={errors.description?.message}
              {...register("description")}
            />
            <Input
              placeholder={t("page.create.dream_source_url")}
              type="text"
              before={<FontAwesomeIcon icon={faLink} />}
              error={errors.sourceUrl?.message}
              {...register("sourceUrl")}
            />
          </Column>
        </Row>
        <Row justifyContent="flex-end">
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
              {isLoading ? t("page.create.creating") : t("page.create.create")}
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
