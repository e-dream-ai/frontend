import { Button, Thumbnail, ThumbnailPlaceholder } from "components/shared";
import {
  ThumbnailButtons,
  ThumbnailContainer,
  ThumbnailOverlay,
} from "components/shared/thumbnail/thumbnail";
import { MAX_FILE_SIZE_MB } from "constants/file.constants";
import { FileUploader } from "react-drag-drop-files";
import { useTranslation } from "react-i18next";
import { MultiMediaState } from "types/media.types";
import {
  handleFileUploaderSizeError,
  handleFileUploaderTypeError,
} from "utils/file-uploader.util";

type ThumbnailInputProps = {
  isLoading?: boolean;
  thumbnail?: string;
  localMultimedia: MultiMediaState;
  editMode: boolean;
  isRemoved: boolean;
  handleChange: (file: Blob) => void;
  handleRemove?: () => void;
  types: string[];
};

export const ThumbnailInput: React.FC<ThumbnailInputProps> = ({
  isLoading,
  thumbnail,
  localMultimedia,
  editMode,
  isRemoved,
  handleChange,
  handleRemove,
  types,
}) => {
  const { t } = useTranslation();
  const hasThumbnail = Boolean(thumbnail) || localMultimedia;

  if (!hasThumbnail && (!editMode || isLoading)) {
    return (
      <ThumbnailPlaceholder>
        <i className="fa fa-picture-o" />
      </ThumbnailPlaceholder>
    );
  }

  return (
    <>
      {hasThumbnail && !isRemoved ? (
        <ThumbnailContainer editMode={editMode}>
          {Boolean(handleRemove) && editMode && (
            <ThumbnailButtons>
              <Button type="button" onClick={handleRemove}>
                <i className="fa fa-trash" />
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
          maxSize={MAX_FILE_SIZE_MB}
          handleChange={handleChange}
          onSizeError={handleFileUploaderSizeError(t)}
          onTypeError={handleFileUploaderTypeError(t)}
          name="file"
          types={types}
        />
      )}
    </>
  );
};
