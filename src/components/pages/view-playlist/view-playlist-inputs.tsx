import { Button, Thumbnail, ThumbnailPlaceholder } from "components/shared";
import {
  ThumbnailButtons,
  ThumbnailContainer,
  ThumbnailOverlay,
} from "components/shared/thumbnail/thumbnail";
import { MAX_FILE_SIZE_MB } from "constants/file.constants";
import { FileUploader } from "react-drag-drop-files";
import { useTranslation } from "react-i18next";
import { MediaState } from "types/media.types";
import { Playlist } from "types/playlist.types";
import {
  handleFileUploaderSizeError,
  handleFileUploaderTypeError,
} from "utils/file-uploader.util";

type ThumbnailPlaylistInputProps = {
  isLoading?: boolean;
  playlist?: Playlist;
  thumbnail: MediaState;
  editMode: boolean;
  isRemoved: boolean;
  handleChange: (file: Blob) => void;
  handleRemove?: () => void;
};

export const ThumbnailPlaylistInput: React.FC<ThumbnailPlaylistInputProps> = ({
  isLoading,
  playlist,
  thumbnail,
  editMode,
  isRemoved,
  handleChange,
  handleRemove,
}) => {
  const { t } = useTranslation();
  const hasThumbnail = Boolean(playlist?.thumbnail) || thumbnail;

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
          {Boolean(handleRemove) && (
            <ThumbnailButtons>
              <Button type="button" onClick={handleRemove}>
                <i className="fa fa-trash" />
              </Button>
            </ThumbnailButtons>
          )}
          <ThumbnailOverlay />
          <Thumbnail url={thumbnail?.url || playlist?.thumbnail} />
        </ThumbnailContainer>
      ) : (
        <FileUploader
          maxSize={MAX_FILE_SIZE_MB}
          handleChange={handleChange}
          onSizeError={handleFileUploaderSizeError(t)}
          onTypeError={handleFileUploaderTypeError(t)}
          name="file"
          types={["JPG", "JPEG"]}
        />
      )}
    </>
  );
};
