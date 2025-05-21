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
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_FILE_SIZE_MB } from "@/constants/file.constants";
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

type ThumbnailInputProps = {
  isLoading?: boolean;
  thumbnail?: string;
  localMultimedia: MultiMediaState;
  editMode: boolean;
  isProcessing?: boolean;
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
  isRemoved,
  handleChange,
  handleRemove,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const hasThumbnail = Boolean(thumbnail) || localMultimedia;

  if (isProcessing && !isLoading) {
    return (
      <ThumbnailPlaceholder fontSize="1.2rem">
        <Row>
          <Column alignItems="center">
            <Spinner />
            <Text color={theme.textBodyColor} mt="1rem">
              {t("components.thumbnail_input.processing")}
            </Text>
          </Column>
        </Row>
      </ThumbnailPlaceholder>
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
          <Thumbnail
            url={localMultimedia?.url || thumbnail}
            src="/images/blank.gif"
          />
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
