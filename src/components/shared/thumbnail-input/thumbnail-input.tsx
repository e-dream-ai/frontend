import {
  Button,
  Column,
  FileUploader,
  Row,
  Thumbnail,
  ThumbnailPlaceholder,
} from "@/components/shared";
import {
  ThumbnailButtons,
  ThumbnailContainer,
  ThumbnailOverlay,
} from "@/components/shared/thumbnail/thumbnail";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_FILE_SIZE_MB,
} from "@/constants/file.constants";
import { useTranslation } from "react-i18next";
import { HandleChangeFile, MultiMediaState } from "@/types/media.types";
import {
  handleFileUploaderSizeError,
  handleFileUploaderTypeError,
} from "@/utils/file-uploader.util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhotoFilm, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "../spinner/spinner";
import { useTheme } from "styled-components";
import Text from "../text/text";
import { useImage } from "@/hooks/useImage";
import ProgressBar from "../progress-bar/progress-bar";
import { formatEta } from "@/utils/video.utils";

type ThumbnailInputProps = {
  isLoading?: boolean;
  thumbnail?: string;
  localMultimedia: MultiMediaState;
  editMode: boolean;
  isProcessing?: boolean;
  jobStatus?: string;
  progress?: number;
  countdown_ms?: number;
  isRemoved: boolean;
  handleChange: HandleChangeFile;
  handleRemove?: () => void;
};

export const ThumbnailInput: React.FC<ThumbnailInputProps> = ({
  isLoading,
  thumbnail,
  localMultimedia,
  editMode,
  isProcessing,
  jobStatus,
  progress,
  countdown_ms,
  isRemoved,
  handleChange,
  handleRemove,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const hasThumbnail = Boolean(thumbnail) || localMultimedia;
  const localUrl = useImage(localMultimedia?.url);

  if (isProcessing && !isLoading && !localMultimedia) {
    const normalizedJobStatus = (jobStatus ?? "").toUpperCase();

    const uiPhase =
      normalizedJobStatus === "IN_PROGRESS"
        ? "RENDERING"
        : normalizedJobStatus === "IN_QUEUE"
          ? "QUEUED"
          : "INGESTING";

    const statusText =
      uiPhase === "QUEUED"
        ? t("components.thumbnail_input.queued")
        : uiPhase === "RENDERING"
          ? t("components.thumbnail_input.rendering")
          : t("components.thumbnail_input.ingesting");

    return (
      <ThumbnailPlaceholder fontSize="1.2rem">
        <Row width="100%" px="2rem" mb="0">
          <Column alignItems="center" width="100%">
            {uiPhase === "RENDERING" ? (
              <ProgressBar
                completed={progress ?? 0}
                width="100%"
                height="16px"
                labelSize="12px"
                borderRadius="8px"
                margin="0 0 1rem 0"
                isLabelVisible={false}
              />
            ) : (
              <Spinner />
            )}
            <Text
              color={theme.textBodyColor}
              mt={uiPhase === "RENDERING" ? "0" : "1rem"}
            >
              {statusText}
              {uiPhase === "RENDERING" && typeof progress === "number"
                ? ` ${progress.toFixed(1)}% done`
                : ""}
              {uiPhase === "RENDERING" && countdown_ms
                ? `, ETA ${formatEta(Math.floor(countdown_ms / 1000))}`
                : ""}
            </Text>
          </Column>
        </Row>
      </ThumbnailPlaceholder>
    );
  }

  if (isProcessing && !isLoading && localMultimedia) {
    const normalizedJobStatus = (jobStatus ?? "").toUpperCase();

    const uiPhase =
      normalizedJobStatus === "IN_PROGRESS"
        ? "RENDERING"
        : normalizedJobStatus === "IN_QUEUE"
          ? "QUEUED"
          : "INGESTING";

    const isRendering = uiPhase === "RENDERING";
    const shouldShowProgressBar = isRendering && typeof progress === "number";

    const statusText =
      uiPhase === "QUEUED"
        ? t("components.thumbnail_input.queued")
        : uiPhase === "RENDERING"
          ? t("components.thumbnail_input.rendering")
          : t("components.thumbnail_input.ingesting");

    return (
      <ThumbnailContainer editMode={false}>
        <ThumbnailOverlay
          style={{
            opacity: 1,
            backgroundColor: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Row
            width="auto"
            px="2rem"
            py="1rem"
            mb="0"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              borderRadius: "8px",
              backdropFilter: "blur(4px)",
              width: "100%",
              height: "fit-content",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              margin: "1rem",
            }}
          >
            <Column alignItems="center" width="100%">
              {shouldShowProgressBar ? (
                <ProgressBar
                  completed={progress}
                  width="100%"
                  height="16px"
                  labelSize="12px"
                  borderRadius="8px"
                  margin="0 0 1rem 0"
                  isLabelVisible={false}
                />
              ) : (
                <Spinner />
              )}
              <Text color="white" mt={shouldShowProgressBar ? "0" : "1rem"}>
                {statusText}
                {uiPhase === "RENDERING" && typeof progress === "number"
                  ? ` ${progress.toFixed(1)}% done`
                  : ""}
                {uiPhase === "RENDERING" && countdown_ms
                  ? `, ETA ${formatEta(Math.floor(countdown_ms / 1000))}`
                  : ""}
              </Text>
            </Column>
          </Row>
        </ThumbnailOverlay>
        <Thumbnail src={localUrl || thumbnail || "/images/blank.gif"} />
      </ThumbnailContainer>
    );
  }

  if (!editMode && (!hasThumbnail || isLoading || isRemoved)) {
    return (
      <ThumbnailPlaceholder>
        <FontAwesomeIcon icon={faPhotoFilm} />
      </ThumbnailPlaceholder>
    );
  }

  return (
    <>
      {hasThumbnail && !isRemoved ? (
        <ThumbnailContainer editMode={editMode}>
          {Boolean(handleRemove) && editMode && (
            <ThumbnailButtons>
              <Button type="button" buttonType="danger" onClick={handleRemove}>
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </ThumbnailButtons>
          )}
          {editMode && <ThumbnailOverlay />}
          <Thumbnail src={localUrl || thumbnail || "/images/blank.gif"} />
        </ThumbnailContainer>
      ) : (
        <FileUploader
          maxSize={MAX_IMAGE_FILE_SIZE_MB}
          handleChange={handleChange}
          onSizeError={handleFileUploaderSizeError(t)}
          onTypeError={handleFileUploaderTypeError(t)}
          name="file"
          types={ALLOWED_IMAGE_TYPES}
        />
      )}
    </>
  );
};
