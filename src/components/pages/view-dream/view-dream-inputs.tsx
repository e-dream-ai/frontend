import { FileUploader, Input } from "@/components/shared";
import {
  ALLOWED_VIDEO_TYPES,
  MAX_FILE_SIZE_MB,
} from "@/constants/file.constants";
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
  faFire,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "@/constants/routes.constants";
import { useNavigate } from "react-router-dom";

type ViewDreamInputsProps = {
  dream?: Dream;
  values: UpdateDreamFormValues;
  register: UseFormRegister<UpdateDreamFormValues>;
  errors: FieldErrors<UpdateDreamFormValues>;
  editMode: boolean;
};

export const ViewDreamInputs: React.FC<ViewDreamInputsProps> = ({
  dream,
  values,
  register,
  errors,
  editMode,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <>
      <Input
        disabled={!editMode}
        placeholder={t("page.view_dream.name")}
        type="text"
        before={<FontAwesomeIcon icon={faFileVideo} />}
        error={errors.name?.message}
        value={values.name}
        {...register("name")}
      />
      <Input
        disabled={!editMode}
        placeholder={t("page.view_dream.activity_level")}
        type="number"
        step="0.01"
        before={<FontAwesomeIcon icon={faFire} />}
        error={errors.activityLevel?.message}
        value={values.activityLevel}
        {...register("activityLevel")}
      />
      <Input
        disabled
        placeholder={t("page.view_dream.owner")}
        type="text"
        before={<FontAwesomeIcon icon={faUser} />}
        value={values.owner}
        anchor={() => navigate(`${ROUTES.PROFILE}/${dream?.user.id ?? 0}`)}
        {...register("owner")}
      />
      <Input
        disabled
        placeholder={t("page.view_dream.created")}
        type="text"
        before={<FontAwesomeIcon icon={faCalendar} />}
        value={values.created_at}
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
          types={ALLOWED_VIDEO_TYPES}
        />
      )}
    </>
  );
};
