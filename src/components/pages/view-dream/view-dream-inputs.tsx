import { FileUploader, Input } from "@/components/shared";
import { MAX_FILE_SIZE_MB } from "@/constants/file.constants";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { UpdateDreamFormValues } from "@/schemas/update-dream.schema";
import { Dream } from "@/types/dream.types";
import { HandleChangeFile, type MultiMediaState } from "@/types/media.types";
import {
  handleFileUploaderSizeError,
  handleFileUploaderTypeError,
} from "@/utils/file-uploader.util";
import { Video, VideoPlaceholder } from "./view-dream.styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faFileVideo,
  faFilm,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

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
        before={<FontAwesomeIcon icon={faFileVideo} />}
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        disabled
        placeholder={t("page.view_dream.owner")}
        type="text"
        before={<FontAwesomeIcon icon={faUser} />}
        {...register("owner")}
      />
      <Input
        disabled
        placeholder={t("page.view_dream.created")}
        type="text"
        before={<FontAwesomeIcon icon={faCalendar} />}
        {...register("created_at")}
      />
    </>
  );
};

type DreamVideoInputProps = {
  isLoading?: boolean;
  dream?: Dream;
  video: MultiMediaState;
  editMode: boolean;
  isRemoved: boolean;
  handleChange: HandleChangeFile;
};

export const DreamVideoInput: React.FC<DreamVideoInputProps> = ({
  isLoading,
  dream,
  video,
  editMode,
  isRemoved,
  handleChange,
}) => {
  const { t } = useTranslation();
  const hasVideo = Boolean(dream?.video) || video;

  if (!hasVideo && (!editMode || isLoading)) {
    return (
      <VideoPlaceholder>
        <FontAwesomeIcon icon={faFilm} />
      </VideoPlaceholder>
    );
  }

  return (
    <>
      {hasVideo && !isRemoved ? (
        <Video controls src={video?.url || dream?.video} />
      ) : (
        <FileUploader
          maxSize={MAX_FILE_SIZE_MB}
          handleChange={handleChange}
          onSizeError={handleFileUploaderSizeError(t)}
          onTypeError={handleFileUploaderTypeError(t)}
          name="file"
          types={["MP4"]}
        />
      )}
    </>
  );
};
