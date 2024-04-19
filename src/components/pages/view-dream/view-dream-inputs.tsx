import { FileUploader, Input } from "@/components/shared";
import {
  ALLOWED_VIDEO_TYPES,
  MAX_FILE_SIZE_MB,
} from "@/constants/file.constants";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";
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
  faClock,
  faFile,
  faFileVideo,
  faFilm,
  faFire,
  faPhotoVideo,
  faRankingStar,
  faSave,
  faShield,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "@/constants/routes.constants";
import { useNavigate } from "react-router-dom";
import {
  DREAM_PERMISSIONS,
  PLAYLIST_PERMISSIONS,
} from "@/constants/permissions.constants";
import Restricted from "@/components/shared/restricted/restricted";
import Select from "@/components/shared/select/select";
import usePermission from "@/hooks/usePermission";
import { useMemo, useState } from "react";
import { useUsers } from "@/api/user/query/useUsers";
import useAuth from "@/hooks/useAuth";
import { isAdmin } from "@/utils/user.util";
import { User } from "@/types/auth.types";
import { getNsfwOptions } from "@/constants/dream.constants";

type ViewDreamInputsProps = {
  dream?: Dream;
  values: UpdateDreamFormValues;
  register: UseFormRegister<UpdateDreamFormValues>;
  errors: FieldErrors<UpdateDreamFormValues>;
  editMode: boolean;
  control: Control<UpdateDreamFormValues>;
};

export const ViewDreamInputs: React.FC<ViewDreamInputsProps> = ({
  dream,
  values,
  register,
  errors,
  editMode,
  control,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userSearch, setUserSearch] = useState<string>("");
  const { user } = useAuth();
  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const isOwner = useMemo(() => user?.id === dream?.user?.id, [user, dream]);
  const { data: usersData, isLoading: isUsersLoading } = useUsers({
    search: userSearch,
  });
  const usersOptions = (usersData?.data?.users ?? [])
    .filter((user) => user.name)
    .map((user) => ({
      label: user?.name ?? "-",
      value: user?.id,
    }));

  const allowedEditOwner = usePermission({
    permission: PLAYLIST_PERMISSIONS.CAN_EDIT_OWNER,
  });

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
      <Restricted to={DREAM_PERMISSIONS.CAN_EDIT_FEATURE_RANK}>
        <Input
          disabled={!editMode}
          placeholder={t("page.view_dream.feature_rank")}
          type="number"
          step="0.01"
          before={<FontAwesomeIcon icon={faRankingStar} />}
          error={errors.activityLevel?.message}
          value={values.featureRank}
          {...register("featureRank")}
        />
      </Restricted>
      <Input
        disabled
        placeholder={t("page.view_dream.duration")}
        type="text"
        before={<FontAwesomeIcon icon={faClock} />}
        value={values.processedVideoFrames}
        {...register("processedVideoFrames")}
      />
      <Input
        disabled
        placeholder={t("page.view_dream.size")}
        type="text"
        before={<FontAwesomeIcon icon={faFile} />}
        value={values.processedVideoSize}
        {...register("processedVideoSize")}
      />
      <Input
        disabled
        placeholder={t("page.view_dream.original_fps")}
        type="text"
        before={<FontAwesomeIcon icon={faPhotoVideo} />}
        value={values.processedVideoFPS}
        {...register("processedVideoFPS")}
      />

      <Restricted to={DREAM_PERMISSIONS.CAN_VIEW_NSFW} isOwner={isOwner}>
        <Controller
          name="nsfw"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              isDisabled={!editMode || !allowedEditOwner}
              placeholder={t("page.view_dream.nsfw")}
              before={<FontAwesomeIcon icon={faShield} />}
              options={getNsfwOptions(t)}
            />
          )}
        />
      </Restricted>

      <Restricted
        to={DREAM_PERMISSIONS.CAN_VIEW_ORIGINAL_OWNER}
        isOwner={isOwner}
      >
        <Input
          disabled
          placeholder={t("page.view_dream.owner")}
          type="text"
          before={<FontAwesomeIcon icon={faSave} />}
          value={values.user}
          anchor={() => navigate(`${ROUTES.PROFILE}/${dream?.user.id ?? 0}`)}
          {...register("user")}
        />
      </Restricted>
      <Controller
        name="displayedOwner"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            placeholder={
              isUserAdmin
                ? t("page.view_dream.displayed_owner")
                : t("page.view_dream.owner")
            }
            isDisabled={!editMode || !allowedEditOwner}
            isLoading={isUsersLoading}
            before={<FontAwesomeIcon icon={faUser} />}
            anchor={() =>
              navigate(`${ROUTES.PROFILE}/${dream?.displayedOwner.id ?? 0}`)
            }
            options={usersOptions}
            onInputChange={(newValue) => setUserSearch(newValue)}
          />
        )}
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
  const hasVideo = Boolean(dream?.original_video) || video;

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
        <Video controls src={video?.url || dream?.original_video} />
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
