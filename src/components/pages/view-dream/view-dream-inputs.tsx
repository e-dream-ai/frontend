import { Input } from "components/shared";
import { FileUploader } from "react-drag-drop-files";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { UpdateDreamFormValues } from "schemas/update-dream.schema";
import { Dream, DreamMediaState } from "types/dream.types";
import {
  Thumbnail,
  ThumbnailPlaceholder,
  Video,
  VideoPlaceholder,
} from "./view-dream.styled";

type ViewDreamInputsProps = {
  register: UseFormRegister<UpdateDreamFormValues>;
  errors: FieldErrors<UpdateDreamFormValues>;
  editMode: boolean;
};

export const ViewDreamInputs: React.FC<ViewDreamInputsProps> = ({
  register,
  errors,
  editMode,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <Input
        disabled={!editMode}
        placeholder={t("page.view_dream.name")}
        type="text"
        before={<i className="fa fa-file-video-o" />}
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        disabled
        placeholder={t("page.view_dream.owner")}
        type="text"
        before={<i className="fa fa-user" />}
        {...register("owner")}
      />
      <Input
        disabled
        placeholder={t("page.view_dream.created")}
        type="text"
        before={<i className="fa fa-calendar" />}
        {...register("created_at")}
      />
    </>
  );
};

type DreamVideoInputProps = {
  isLoading?: boolean;
  dream?: Dream;
  video: DreamMediaState;
  editMode: boolean;
  isRemoved: boolean;
  handleChange: (file: Blob) => void;
};

export const DreamVideoInput: React.FC<DreamVideoInputProps> = ({
  isLoading,
  dream,
  video,
  editMode,
  isRemoved,
  handleChange,
}) => {
  const hasVideo = Boolean(dream?.video) || video;

  if (!hasVideo && (!editMode || isLoading)) {
    return (
      <VideoPlaceholder>
        <i className="fa fa-play" />
      </VideoPlaceholder>
    );
  }

  return (
    <>
      {hasVideo && !isRemoved ? (
        <Video controls src={video?.url || dream?.video} />
      ) : (
        <FileUploader handleChange={handleChange} name="file" types={["MP4"]} />
      )}
    </>
  );
};

type ThumbnailDreamInputProps = {
  isLoading?: boolean;
  dream?: Dream;
  thumbnail: DreamMediaState;
  editMode: boolean;
  isRemoved: boolean;
  handleChange: (file: Blob) => void;
};

export const ThumbnailDreamInput: React.FC<ThumbnailDreamInputProps> = ({
  isLoading,
  dream,
  thumbnail,
  editMode,
  isRemoved,
  handleChange,
}) => {
  const hasThumbnail = Boolean(dream?.thumbnail) || thumbnail;
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
        <Thumbnail src={thumbnail?.url || dream?.thumbnail} />
      ) : (
        <FileUploader
          handleChange={handleChange}
          name="file"
          types={["JPG", "JPEG"]}
        />
      )}
    </>
  );
};
