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
import { DreamProcessingPhase } from "@/types/dream.types";
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

type ThumbnailInputProps = {
  isLoading?: boolean;
  thumbnail?: string;
  localMultimedia: MultiMediaState;
  editMode: boolean;
  processingPhase?: DreamProcessingPhase;
  isRemoved: boolean;
  handleChange: HandleChangeFile;
  handleRemove?: () => void;
};

const PROCESSING_PHASE_LABEL_KEYS: Record<DreamProcessingPhase, string> = {
  QUEUED: "components.thumbnail_input.queued",
  RENDERING: "components.thumbnail_input.rendering",
  INGESTING: "components.thumbnail_input.ingesting",
};

const ProcessingThumbnail: React.FC<{ phase: DreamProcessingPhase }> = ({
  phase,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ThumbnailPlaceholder fontSize="1.2rem">
      <Row width="100%" px="2rem" mb="0">
        <Column alignItems="center" width="100%">
          <Spinner />
          <Text color={theme.textBodyColor} mt="1rem">
            {t(PROCESSING_PHASE_LABEL_KEYS[phase])}
          </Text>
        </Column>
      </Row>
    </ThumbnailPlaceholder>
  );
};

export const ThumbnailInput: React.FC<ThumbnailInputProps> = ({
  isLoading,
  thumbnail,
  localMultimedia,
  editMode,
  processingPhase,
  isRemoved,
  handleChange,
  handleRemove,
}) => {
  const { t } = useTranslation();
  const hasThumbnail = Boolean(thumbnail) || localMultimedia;
  const localUrl = useImage(localMultimedia?.url);

  if (processingPhase && !isLoading && !localMultimedia) {
    return <ProcessingThumbnail phase={processingPhase} />;
  }

  if (processingPhase && !isLoading && localMultimedia) {
    return (
      <ThumbnailContainer editMode={false}>
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
