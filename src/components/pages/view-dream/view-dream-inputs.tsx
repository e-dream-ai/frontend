import { Column, Row, FileUploader, Input, TextArea, Button } from "@/components/shared";
import { ThumbnailInput } from "@/components/shared/thumbnail-input/thumbnail-input";
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
  faBook,
  faCalendar,
  faClock,
  faComment,
  faFile,
  faFileVideo,
  faFilm,
  faFire,
  faLink,
  faMicrochip,
  faPhotoVideo,
  faRankingStar,
  faSave,
  faShield,
  faThumbsDown,
  faThumbsUp,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "@/constants/routes.constants";
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
import {
  getCcaLicenceOptions,
  getNsfwOptions,
} from "@/constants/dream.constants";
import { useImage } from "@/hooks/useImage";

type ViewDreamInputsProps = {
  dream?: Dream;
  isProcessing?: boolean;
  values: UpdateDreamFormValues;
  register: UseFormRegister<UpdateDreamFormValues>;
  errors: FieldErrors<UpdateDreamFormValues>;
  editMode: boolean;
  control: Control<UpdateDreamFormValues>;

  // thumbnail
  thumbnailState: MultiMediaState;
  isThumbnailRemoved: boolean;
  handleThumbnailChange: HandleChangeFile;
  handleRemoveThumbnail: () => void;
};

const FLEX_INPUT = ["1 1 100%", "1 1 100%", "1 1 calc(50% - 1rem)", "1 1 calc(50% - 1rem)"];

export const ViewDreamInputs: React.FC<ViewDreamInputsProps> = ({
  dream,
  isProcessing,
  values,
  register,
  errors,
  editMode,
  control,
  // thumbnail
  thumbnailState,
  isThumbnailRemoved,
  handleThumbnailChange,
  handleRemoveThumbnail
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userSearch, setUserSearch] = useState<string>("");
  const [showMore, setShowMore] = useState<boolean>(false);
  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const isOwner = useMemo(() => user?.id === dream?.user?.id, [user, dream]);
  const { data: usersData, isLoading: isUsersLoading } = useUsers({
    search: userSearch,
  });

  const switchShowMore = () => setShowMore(v => !v);

  const usersOptions = (usersData?.data?.users ?? [])
    .filter((user) => user.name)
    .map((user) => ({
      label: user?.name ?? "-",
      value: user?.id,
    }));

  const allowedEditOwner = usePermission({
    permission: PLAYLIST_PERMISSIONS.CAN_EDIT_OWNER,
  });
  const thumbnailUrl = useImage(dream?.thumbnail, {
    width: 500,
    fit: "cover",
  });

  return (
    <>
      <Row
        flex="auto"
        flexDirection={["column", "row", "row", "row"]}
        m={0}
      >
        <Column
          flex="1"
          mr={[0, 2, 2, 2]}
          mb={[2, 0, 0, 0]}
        >
          <ThumbnailInput
            localMultimedia={thumbnailState}
            thumbnail={thumbnailUrl}
            editMode={editMode}
            isProcessing={isProcessing}
            isRemoved={isThumbnailRemoved}
            handleChange={handleThumbnailChange}
            handleRemove={handleRemoveThumbnail}
          />
        </Column>
        <Column
          flex="1"
          ml={[0, 2, 2]}
        >
          <Input
            disabled={!editMode}
            placeholder={t("page.view_dream.name")}
            type="text"
            before={<FontAwesomeIcon icon={faFileVideo} />}
            error={errors.name?.message}
            value={values.name}
            {...register("name")}
          />
          <Restricted
            to={DREAM_PERMISSIONS.CAN_VIEW_ORIGINAL_OWNER}
            isOwner={isOwner}
          >
            <Row flex={FLEX_INPUT} m={0}>
              <Input
                disabled
                placeholder={t("page.view_dream.owner")}
                type="text"
                before={<FontAwesomeIcon icon={faSave} />}
                value={values.user}
                to={`${ROUTES.PROFILE}/${dream?.user.uuid}`}
                {...register("user")}
              />
            </Row>
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
            placeholder={t("page.view_dream.created")}
            type="text"
            before={<FontAwesomeIcon icon={faCalendar} />}
            value={values.created_at}
            {...register("created_at")}
          />
          <Input
            disabled
            placeholder={t("page.view_dream.upvotes")}
            type="text"
            before={<FontAwesomeIcon icon={faThumbsUp} />}
            value={values.upvotes}
            {...register("upvotes")}
          />
          <Input
            disabled
            placeholder={t("page.view_dream.downvotes")}
            type="text"
            before={<FontAwesomeIcon icon={faThumbsDown} />}
            value={values.downvotes}
            {...register("downvotes")}
          />

        </Column>
      </Row>
      <Row flex="auto" m={0}>
        <Column flex="auto" m={0}>
          <TextArea
            linkify
            disabled={!editMode}
            placeholder={t("page.view_dream.description")}
            before={<FontAwesomeIcon icon={faComment} />}
            error={errors.description?.message}
            value={values.description}
            {...register("description")}
          />
        </Column>
      </Row>

      <Row flex="auto" flexWrap="wrap" m={0} style={{
        // @ts-expect-error column-gap is valid
        "column-gap": "1rem"
      }}>
        <Row flex={FLEX_INPUT} m={0}>
          <Controller
            name="ccbyLicense"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                isDisabled={!editMode || !allowedEditOwner}
                placeholder={t("page.view_dream.ccby_license")}
                before={<FontAwesomeIcon icon={faBook} />}
                options={getCcaLicenceOptions(t)}
              />
            )}
          />
        </Row>
        <Restricted to={DREAM_PERMISSIONS.CAN_VIEW_NSFW} isOwner={isOwner}>
          <Row flex={FLEX_INPUT} m={0}>
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
          </Row>
        </Restricted>
        <Row flex={FLEX_INPUT} m={0}>
          <Input
            linkify
            disabled={!editMode}
            placeholder={t("page.view_dream.source_url")}
            type="text"
            before={<FontAwesomeIcon icon={faLink} />}
            error={errors.sourceUrl?.message}
            value={values.sourceUrl}
            {...register("sourceUrl")}
          />
        </Row>
      </Row>
      <Row flex="auto" justifyContent="center">
        <Button type="button" size="sm" buttonType="tertiary" onClick={switchShowMore}>
          {showMore ? t("page.view_dream.less") : t("page.view_dream.more")} {showMore ? "-" : "+"}
        </Button>
      </Row>

      {showMore &&
        <Row flex="auto" flexWrap="wrap" m={0} style={{
          // @ts-expect-error column-gap is valid
          "column-gap": "1rem"
        }}>
          <Row flex={FLEX_INPUT} m={0}>
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
          </Row>
          <Restricted to={DREAM_PERMISSIONS.CAN_EDIT_FEATURE_RANK}>
            <Row flex={FLEX_INPUT} m={0}>
              <Input
                disabled={!editMode}
                placeholder={t("page.view_dream.feature_rank")}
                type="number"
                step="0.01"
                before={<FontAwesomeIcon icon={faRankingStar} />}
                error={errors.featureRank?.message}
                value={values.featureRank}
                {...register("featureRank")}
              />
            </Row>
          </Restricted>

          <Row flex={FLEX_INPUT} m={0}>
            <Input
              disabled
              placeholder={t("page.view_dream.size")}
              type="text"
              before={<FontAwesomeIcon icon={faFile} />}
              value={values.processedVideoSize}
              {...register("processedVideoSize")}
            />
          </Row>
          <Row flex={FLEX_INPUT} m={0}>
            <Input
              disabled
              placeholder={t("page.view_dream.original_fps")}
              type="text"
              before={<FontAwesomeIcon icon={faPhotoVideo} />}
              value={values.processedVideoFPS}
              {...register("processedVideoFPS")}
            />
          </Row>
          <Row flex={FLEX_INPUT} m={0}>
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
                  to={
                    dream?.displayedOwner?.uuid
                      ? `${ROUTES.PROFILE}/${dream?.displayedOwner?.uuid}`
                      : undefined
                  }
                  options={usersOptions}
                  onInputChange={(newValue) => setUserSearch(newValue)}
                />
              )}
            />
          </Row>
          <Restricted to={DREAM_PERMISSIONS.CAN_VIEW_PROCESSED_AT}>
            <Row flex={FLEX_INPUT} m={0}>
              <Input
                disabled
                placeholder={t("page.view_dream.processed")}
                type="text"
                before={<FontAwesomeIcon icon={faMicrochip} />}
                value={values.processed_at}
                {...register("processed_at")}
              />
            </Row>
          </Restricted>
        </Row>
      }
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
