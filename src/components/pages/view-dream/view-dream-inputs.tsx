import { Column, Row, FileUploader, Input, Button } from "@/components/shared";
import { ThumbnailInput } from "@/components/shared/thumbnail-input/thumbnail-input";
import {
  ALLOWED_VIDEO_TYPES,
  MAX_FILE_SIZE_MB,
} from "@/constants/file.constants";
import { Controller, useFormContext } from "react-hook-form";
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
  faAlignLeft,
  faBook,
  faCalendar,
  faClock,
  faComment,
  faEye,
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
import { DREAM_PERMISSIONS } from "@/constants/permissions.constants";
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
  getHiddenOptions,
  getNsfwOptions,
} from "@/constants/select.constants";
import { useImage } from "@/hooks/useImage";
import { FormContainer, FormItem } from "@/components/shared/form/form";
import { getUserProfileRoute } from "@/utils/router.util";
import { KeyframeSelect } from "./keyframe-select";
import { useTooltipPlaces } from "@/hooks/useFormTooltipPlaces";
import { FormInput } from "@/components/shared/input/input";
import { FormTextArea } from "@/components/shared/text-area/text-area";
import {
  TextAreaGroup,
  TextAreaRow,
  TextAreaBefore,
} from "@/components/shared/text-area/text-area.styled";
import { JsonEditor } from "json-edit-react";
import styled from "styled-components";

const JsonEditorWrapper = styled.div<{ disabled?: boolean }>`
  width: 100%;
  width: -moz-available;
  width: -webkit-fill-available;
  width: fill-available;
  min-height: 2.5rem;
  max-height: 8rem;
  overflow-y: auto;
  overflow-x: hidden;
  resize: none;
  background: ${(props) =>
    props.disabled
      ? props.theme.inputBackgroundColor
      : props.theme.colorBackgroundSecondary};
  border-radius: 0;
  border: 0;
  color: ${(props) => props.theme.inputTextColorPrimary};
  font-size: 1rem;
  font-family: inherit;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "auto")};

  & > div {
    background: transparent !important;
  }

  & * {
    color: ${(props) => props.theme.inputTextColorPrimary} !important;
  }
`;

type ViewDreamInputsProps = {
  dream?: Dream;
  isProcessing?: boolean;
  // values: UpdateDreamFormValues;
  // register: UseFormRegister<UpdateDreamFormValues>;
  // errors: FieldErrors<UpdateDreamFormValues>;
  // control: Control<UpdateDreamFormValues>;
  editMode: boolean;

  // thumbnail
  thumbnailState: MultiMediaState;
  isThumbnailRemoved: boolean;
  handleThumbnailChange: HandleChangeFile;
  handleRemoveThumbnail: () => void;
};

export const ViewDreamInputs: React.FC<ViewDreamInputsProps> = ({
  dream,
  isProcessing,
  editMode,
  // thumbnail
  thumbnailState,
  isThumbnailRemoved,
  handleThumbnailChange,
  handleRemoveThumbnail,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const tooltipPlaces = useTooltipPlaces();
  const [userSearch, setUserSearch] = useState<string>("");
  const [showMore, setShowMore] = useState<boolean>(false);
  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const isOwner = useMemo(() => user?.id === dream?.user?.id, [user, dream]);

  const { control, register } = useFormContext<UpdateDreamFormValues>();

  // always shows user for admins
  // for normal users look for 'displayed owner' or user instead
  const dreamOwnerToShow = isUserAdmin
    ? dream?.user?.name
    : dream?.displayedOwner?.name ?? dream?.user?.name;

  const { data: usersData, isLoading: isUsersLoading } = useUsers({
    search: userSearch,
  });

  const switchShowMore = () => setShowMore((v) => !v);

  const usersOptions = (usersData?.data?.users ?? [])
    .filter((user) => user.name)
    .map((user) => ({
      label: user?.name ?? "-",
      value: user?.id,
    }));

  const allowedEditOwner = usePermission({
    permission: DREAM_PERMISSIONS.CAN_EDIT_OWNER,
  });

  const allowedEditVisibility = usePermission({
    permission: DREAM_PERMISSIONS.CAN_EDIT_VISIBILITY,
  });

  const thumbnailUrl = useImage(dream?.thumbnail, {
    width: 500,
    fit: "cover",
  });

  return (
    <>
      <Row flex="auto" flexDirection={["column", "row", "row", "row"]} m={0}>
        <Column flex="1" mr={[0, 2, 2, 2]} mb={4}>
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
        <Column flex="1" ml={[0, 2, 2]}>
          {
            // Show only for owners when dream is hidden
            isOwner && dream?.hidden && (
              <Input
                disabled
                outlined
                type="text"
                placeholder={t("page.view_playlist.visibility")}
                before={<FontAwesomeIcon icon={faEye} />}
                value={t("dream.hidden.hidden")}
                name="visibility-for-owner"
              />
            )
          }
          <FormInput
            disabled={!editMode}
            placeholder={t("page.view_dream.name")}
            type="text"
            before={<FontAwesomeIcon icon={faFileVideo} />}
            {...register("name")}
          />
          <Input
            disabled
            placeholder={t("page.view_dream.owner")}
            type="text"
            before={<FontAwesomeIcon icon={faSave} />}
            value={dreamOwnerToShow}
            to={getUserProfileRoute(dream?.user)}
            {...register("user")}
          />
          <FormInput
            disabled
            placeholder={t("page.view_dream.duration")}
            type="text"
            before={<FontAwesomeIcon icon={faClock} />}
            {...register("processedVideoFrames")}
          />
          <FormInput
            disabled
            placeholder={t("page.view_dream.created")}
            type="text"
            before={<FontAwesomeIcon icon={faCalendar} />}
            {...register("created_at")}
          />
          <FormInput
            disabled
            placeholder={t("page.view_dream.upvotes")}
            type="text"
            before={<FontAwesomeIcon icon={faThumbsUp} />}
            {...register("upvotes")}
          />
          <FormInput
            disabled
            placeholder={t("page.view_dream.downvotes")}
            type="text"
            before={<FontAwesomeIcon icon={faThumbsDown} />}
            {...register("downvotes")}
          />
        </Column>
      </Row>
      <Row flex="auto" m={0}>
        <Column flex="auto" m={0}>
          <FormTextArea
            linkify
            disabled={!editMode}
            placeholder={t("page.view_dream.description")}
            before={<FontAwesomeIcon icon={faAlignLeft} />}
            {...register("description")}
          />
        </Column>
      </Row>
      <Row flex="auto" m={0}>
        <Column flex="auto" m={0}>
          <Controller
            name="prompt"
            control={control}
            render={({ field }) => {
              const isValidJsonObject = (
                value: unknown,
              ): value is Record<string, unknown> | null => {
                return (
                  value === null ||
                  (typeof value === "object" && !Array.isArray(value))
                );
              };

              const extractActualData = (
                data: Record<string, unknown> | null,
              ): Record<string, unknown> | null => {
                if (data === null) return null;
                if ("newData" in data)
                  return data.newData as Record<string, unknown> | null;
                if ("newValue" in data)
                  return data.newValue as Record<string, unknown> | null;
                return data;
              };

              const parseUpdatedData = (
                updatedData: unknown,
              ): Record<string, unknown> | null => {
                if (updatedData === null || updatedData === undefined) {
                  return null;
                }

                if (typeof updatedData === "string") {
                  try {
                    const parsed = JSON.parse(updatedData);
                    if (!isValidJsonObject(parsed)) return null;
                    return extractActualData(parsed);
                  } catch {
                    return null;
                  }
                }

                if (isValidJsonObject(updatedData)) {
                  return extractActualData(updatedData);
                }

                return null;
              };

              const handleUpdate = (updatedData: unknown) => {
                if (!editMode) return;

                try {
                  const validData = parseUpdatedData(updatedData);
                  if (validData !== null || updatedData === null) {
                    field.onChange(validData);
                  }
                } catch (error) {
                  console.error("Error updating prompt", error);
                }
              };

              return (
                <TextAreaGroup>
                  <TextAreaRow>
                    <TextAreaBefore>
                      <FontAwesomeIcon icon={faComment} />
                    </TextAreaBefore>
                    <JsonEditorWrapper disabled={!editMode}>
                      <JsonEditor
                        data={field.value || {}}
                        onUpdate={handleUpdate}
                        restrictEdit={!editMode}
                        restrictDelete={!editMode}
                        restrictAdd={!editMode}
                        restrictDrag={!editMode}
                        restrictTypeSelection={!editMode}
                        collapse={false}
                        rootName={t("page.view_dream.prompt")}
                      />
                    </JsonEditorWrapper>
                  </TextAreaRow>
                </TextAreaGroup>
              );
            }}
          />
        </Column>
      </Row>

      <FormContainer>
        <FormItem>
          <Controller
            name="ccbyLicense"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                isDisabled={!editMode}
                placeholder={t("page.view_dream.ccby_license")}
                before={<FontAwesomeIcon icon={faBook} />}
                options={getCcaLicenceOptions(t)}
                tooltipPlace={tooltipPlaces.left}
              />
            )}
          />
        </FormItem>
        <Restricted to={DREAM_PERMISSIONS.CAN_VIEW_NSFW} isOwner={isOwner}>
          <FormItem>
            <Controller
              name="nsfw"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isDisabled={!editMode}
                  placeholder={t("page.view_dream.nsfw")}
                  before={<FontAwesomeIcon icon={faShield} />}
                  options={getNsfwOptions(t)}
                  tooltipPlace={tooltipPlaces.right}
                />
              )}
            />
          </FormItem>
        </Restricted>
        <FormItem>
          <FormInput
            linkify
            disabled={!editMode}
            placeholder={t("page.view_dream.source_url")}
            type="text"
            before={<FontAwesomeIcon icon={faLink} />}
            tooltipPlace={tooltipPlaces.left}
            {...register("sourceUrl")}
          />
        </FormItem>

        {/* If user is admin, show editable hidden field */}
        <Restricted to={DREAM_PERMISSIONS.CAN_EDIT_VISIBILITY}>
          <FormItem>
            <Controller
              name="hidden"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isDisabled={!editMode || !allowedEditVisibility}
                  placeholder={t("page.view_dream.visibility")}
                  before={<FontAwesomeIcon icon={faEye} />}
                  options={getHiddenOptions(t)}
                  tooltipPlace={tooltipPlaces.right}
                />
              )}
            />
          </FormItem>
        </Restricted>
      </FormContainer>

      <Row flex="auto" justifyContent="center">
        <Button
          type="button"
          size="sm"
          buttonType="tertiary"
          onClick={switchShowMore}
        >
          {showMore ? t("page.view_dream.less") : t("page.view_dream.more")}{" "}
          {showMore ? "-" : "+"}
        </Button>
      </Row>

      {showMore && (
        <FormContainer>
          <FormItem>
            <FormInput
              disabled={!editMode}
              placeholder={t("page.view_dream.activity_level")}
              type="number"
              step="0.01"
              before={<FontAwesomeIcon icon={faFire} />}
              tooltipPlace={tooltipPlaces.left}
              {...register("activityLevel")}
            />
          </FormItem>
          <Restricted to={DREAM_PERMISSIONS.CAN_EDIT_FEATURE_RANK}>
            <FormItem>
              <FormInput
                disabled={!editMode}
                placeholder={t("page.view_dream.feature_rank")}
                type="number"
                step="0.01"
                before={<FontAwesomeIcon icon={faRankingStar} />}
                tooltipPlace={tooltipPlaces.right}
                {...register("featureRank")}
              />
            </FormItem>
          </Restricted>

          <FormItem>
            <FormInput
              disabled
              placeholder={t("page.view_dream.size")}
              type="text"
              before={<FontAwesomeIcon icon={faFile} />}
              tooltipPlace={tooltipPlaces.left}
              {...register("processedVideoSize")}
            />
          </FormItem>
          <FormItem>
            <FormInput
              disabled
              placeholder={t("page.view_dream.original_fps")}
              type="text"
              before={<FontAwesomeIcon icon={faPhotoVideo} />}
              tooltipPlace={tooltipPlaces.right}
              {...register("processedVideoFPS")}
            />
          </FormItem>
          <Restricted
            to={DREAM_PERMISSIONS.CAN_VIEW_ORIGINAL_OWNER}
            isOwner={isOwner}
          >
            <FormItem>
              <Controller
                name="displayedOwner"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder={t("page.view_dream.displayed_owner")}
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
                    tooltipPlace={tooltipPlaces.left}
                  />
                )}
              />
            </FormItem>
          </Restricted>
          <Restricted to={DREAM_PERMISSIONS.CAN_VIEW_PROCESSED_AT}>
            <FormItem>
              <FormInput
                disabled
                placeholder={t("page.view_dream.processed")}
                type="text"
                before={<FontAwesomeIcon icon={faMicrochip} />}
                tooltipPlace={tooltipPlaces.right}
                {...register("processed_at")}
              />
            </FormItem>
          </Restricted>
          <FormItem>
            <KeyframeSelect
              name="startKeyframe"
              control={control}
              placeholder={t("page.view_dream.start_keyframe")}
              editMode={editMode}
              tooltipPlace={tooltipPlaces.left}
            />
          </FormItem>
          <FormItem>
            <KeyframeSelect
              name="endKeyframe"
              control={control}
              placeholder={t("page.view_dream.end_keyframe")}
              editMode={editMode}
              tooltipPlace={tooltipPlaces.right}
            />
          </FormItem>
        </FormContainer>
      )}
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
