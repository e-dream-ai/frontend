import { Column, Row, FileUploader, Input, Button } from "@/components/shared";
import { ThumbnailInput } from "@/components/shared/thumbnail-input/thumbnail-input";
import {
  ALLOWED_VIDEO_TYPES,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE_MB,
  MAX_IMAGE_FILE_SIZE_MB,
} from "@/constants/file.constants";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { UpdateDreamFormValues } from "@/schemas/update-dream.schema";
import { Dream, DreamMediaType, DreamStatusType } from "@/types/dream.types";
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
  faDesktop,
  faExclamationCircle,
  faEye,
  faFile,
  faFileVideo,
  faFilm,
  faFire,
  faImage,
  faLink,
  faMicrochip,
  faPhotoVideo,
  faRankingStar,
  faSave,
  faShield,
  faStopwatch,
  faThumbsDown,
  faThumbsUp,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "@/constants/routes.constants";
import { DREAM_PERMISSIONS } from "@/constants/permissions.constants";
import Restricted from "@/components/shared/restricted/restricted";
import Select from "@/components/shared/select/select";
import usePermission from "@/hooks/usePermission";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useUsers } from "@/api/user/query/useUsers";
import useAuth from "@/hooks/useAuth";
import { toast } from "react-toastify";
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
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { linter, Diagnostic } from "@codemirror/lint";
import styled from "styled-components";
import { materialDark } from "@uiw/codemirror-theme-material";
import { faUpDown } from "@fortawesome/free-solid-svg-icons";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { PrimaryTheme } from "@/constants/colors.constants";

export interface JobProgressData {
  jobId: string;
  dream_uuid: string;
  status?: string;
  progress?: number;
}

const CodeMirrorWrapper = styled.div<{
  disabled?: boolean;
  height?: number;
  maxHeight?: number;
}>`
  width: 100%;
  width: -moz-available;
  width: -webkit-fill-available;
  width: fill-available;
  min-height: 2.5rem;
  height: ${(props) => (props.height ? `${props.height}px` : "2.5rem")};
  max-height: ${(props) => (props.maxHeight ? `${props.maxHeight}px` : "8rem")};
  overflow-y: auto;
  overflow-x: hidden;
  background: ${(props) =>
    props.disabled
      ? props.theme.inputBackgroundColor
      : props.theme.colorBackgroundSecondary};
  border-radius: 0;
  border: 0;
  display: flex;
  flex-direction: column;
  align-self: stretch;
  position: relative;

  .cm-editor {
    background: transparent !important;
    font-size: 1rem;
  }

  .cm-scroller {
    overflow-x: auto;
  }

  .cm-content {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .cm-gutters {
    background: transparent !important;
    border: 0;
  }

  .cm-line {
    font-family: "Roboto Mono", monospace;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const ResizeHandle = styled(motion.div)`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  cursor: ns-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.textSecondaryColor};
  opacity: 0.6;
  transition: opacity 0.2s;
  z-index: 10;
  background: ${(props) => props.theme.colorBackgroundSecondary};

  &:hover {
    opacity: 1;
  }

  svg {
    font-size: 16px;
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
  onPromptValidationRequest?: (validate: () => boolean) => void;
  onPromptResetRequest?: (reset: () => void) => void;
  progress?: number;
  jobStatus?: string;
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
  onPromptValidationRequest,
  onPromptResetRequest,
  progress,
  jobStatus,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const tooltipPlaces = useTooltipPlaces();
  const [userSearch, setUserSearch] = useState<string>("");
  const [showMore, setShowMore] = useState<boolean>(false);
  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const isOwner = useMemo(() => user?.id === dream?.user?.id, [user, dream]);
  const promptStringRef = useRef<string>("");
  const [editorHeight, setEditorHeight] = useState<number | undefined>(
    undefined,
  );
  const [isManuallyResized, setIsManuallyResized] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(40);
  const codeMirrorWrapperRef = useRef<HTMLDivElement>(null);
  const scrollOffset = useMotionValue<number>(0);
  const smoothScrollOffset = useSpring(scrollOffset, {
    stiffness: 1100,
    damping: 120,
    mass: 0.2,
  });
  const handlePosition = useTransform(smoothScrollOffset, (value) => -value);

  const { control, register, setError, clearErrors, getValues } =
    useFormContext<UpdateDreamFormValues>();

  // always shows user for admins
  // for normal users look for 'displayed owner' or user instead
  const dreamOwnerToShow = isUserAdmin
    ? dream?.user?.name
    : dream?.displayedOwner?.name ?? dream?.user?.name;

  const { data: usersData, isLoading: isUsersLoading } = useUsers({
    search: userSearch,
  });

  const switchShowMore = () => setShowMore((v) => !v);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsManuallyResized(true);
      isDraggingRef.current = true;
      startYRef.current = e.clientY;
      const currentHeight = editorHeight ?? 40;
      startHeightRef.current = currentHeight;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDraggingRef.current) return;

        const deltaY = moveEvent.clientY - startYRef.current;
        const newHeight = Math.max(
          40,
          Math.min(800, startHeightRef.current + deltaY),
        );
        setEditorHeight(newHeight);
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [editorHeight],
  );

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

  const isImageDream = dream?.mediaType === DreamMediaType.IMAGE;
  const isDreamFailed = dream?.status === DreamStatusType.FAILED;

  return (
    <>
      <Row flex="auto" flexDirection={["column", "row", "row", "row"]} m={0}>
        <Column flex="1" mr={[0, 2, 2, 2]} mb={4}>
          {isDreamFailed ? (
            <div
              style={{
                width: "100%",
                aspectRatio: "16/9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: PrimaryTheme.inputBackgroundColor,
                borderRadius: "8px",
                border: `2px dashed ${PrimaryTheme.colorDanger}`,
              }}
            >
              <FontAwesomeIcon
                icon={faExclamationCircle}
                style={{ fontSize: "64px", color: PrimaryTheme.colorDanger }}
              />
            </div>
          ) : (
            <ThumbnailInput
              localMultimedia={thumbnailState}
              thumbnail={thumbnailUrl}
              editMode={editMode}
              isProcessing={isProcessing}
              jobStatus={jobStatus}
              progress={progress}
              isRemoved={isThumbnailRemoved}
              handleChange={handleThumbnailChange}
              handleRemove={handleRemoveThumbnail}
            />
          )}
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
          {!isImageDream && (
            <FormInput
              disabled
              placeholder={t("page.view_dream.duration")}
              type="text"
              before={<FontAwesomeIcon icon={faClock} />}
              {...register("processedVideoFrames")}
            />
          )}
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
      <Row flex="auto" m={0} style={{ overflowY: "hidden" }}>
        <Column flex="auto" m={0}>
          <Controller
            name="prompt"
            control={control}
            render={({ field }) => {
              const calculateContentHeight = useCallback(
                (content: string): number => {
                  if (!content || content.trim() === "" || content === "{}") {
                    return 40;
                  }
                  const lines = content.split("\n").length;
                  const lineHeight = 24; // Approximate line height in pixels
                  const padding = 12; // Top and bottom padding
                  const calculatedHeight = Math.max(
                    40,
                    lines * lineHeight + padding,
                  );
                  const maxHeight = 128; // 8rem = 128px
                  return Math.min(calculatedHeight, maxHeight);
                },
                [],
              );

              useEffect(() => {
                if (!editMode) {
                  const newValue = field.value
                    ? JSON.stringify(field.value, null, 2)
                    : "{}";
                  promptStringRef.current = newValue;
                }
                if (isManuallyResized) return;
                const content = field.value
                  ? JSON.stringify(field.value, null, 2)
                  : "{}";
                const calculatedHeight = calculateContentHeight(content);
                if (!isDraggingRef.current) {
                  setEditorHeight(calculatedHeight);
                }
              }, [
                field.value,
                editMode,
                calculateContentHeight,
                isManuallyResized,
              ]);

              useEffect(() => {
                if (onPromptValidationRequest) {
                  onPromptValidationRequest(() => {
                    try {
                      JSON.parse(promptStringRef.current);
                      clearErrors("prompt");
                      return true;
                    } catch (error) {
                      if (
                        promptStringRef.current.trim() !== "" &&
                        promptStringRef.current !== "{}"
                      ) {
                        setError("prompt", {
                          type: "manual",
                          message: t("page.view_dream.invalid_prompt_json"),
                        });
                        toast.error(t("page.view_dream.invalid_prompt_json"));
                        return false;
                      }
                      return true;
                    }
                  });
                }
              }, [onPromptValidationRequest, setError, clearErrors, t]);

              useEffect(() => {
                if (onPromptResetRequest) {
                  onPromptResetRequest(() => {
                    const currentValue = getValues("prompt");
                    const resetValue = currentValue
                      ? JSON.stringify(currentValue, null, 2)
                      : "{}";
                    promptStringRef.current = resetValue;
                    clearErrors("prompt");
                  });
                }
              }, [onPromptResetRequest, getValues, clearErrors]);

              const handleChange = (value: string) => {
                if (!editMode) return;

                promptStringRef.current = value;

                if (!isManuallyResized && !isDraggingRef.current) {
                  const calculatedHeight = calculateContentHeight(value);
                  setEditorHeight(calculatedHeight);
                }

                try {
                  const parsedValue = JSON.parse(value);
                  field.onChange(parsedValue);
                  clearErrors("prompt");
                } catch (error) {
                  clearErrors("prompt");
                }
              };

              const handleScroll = useCallback(() => {
                if (codeMirrorWrapperRef.current) {
                  scrollOffset.set(codeMirrorWrapperRef.current.scrollTop);
                }
              }, [scrollOffset]);

              useEffect(() => {
                const wrapper = codeMirrorWrapperRef.current;
                if (wrapper) {
                  wrapper.addEventListener("scroll", handleScroll);
                  return () => {
                    wrapper.removeEventListener("scroll", handleScroll);
                  };
                }
              }, [handleScroll]);

              const jsonLinter = linter((view) => {
                const diagnostics: Diagnostic[] = [];
                const content = view.state.doc.toString();

                if (!content.trim() || !editMode) {
                  return diagnostics;
                }

                try {
                  JSON.parse(content);
                } catch (error) {
                  const errorMessage =
                    error instanceof Error ? error.message : "Invalid JSON";

                  const match = errorMessage.match(/position (\d+)/);
                  const position = match ? parseInt(match[1], 10) : 0;

                  let from = Math.max(0, position);
                  let to = Math.min(content.length, position + 1);

                  if (from === to && from === 0) {
                    to = Math.min(content.length, 50);
                  }

                  diagnostics.push({
                    from,
                    to,
                    severity: "error",
                    message: errorMessage,
                  });
                }

                return diagnostics;
              });

              return (
                <TextAreaGroup>
                  <TextAreaRow>
                    <TextAreaBefore>
                      <FontAwesomeIcon icon={faComment} />
                    </TextAreaBefore>
                    <CodeMirrorWrapper
                      ref={codeMirrorWrapperRef}
                      disabled={!editMode}
                      height={editorHeight}
                      maxHeight={isManuallyResized ? 800 : 128}
                    >
                      <CodeMirror
                        value={promptStringRef.current}
                        onChange={handleChange}
                        extensions={[json(), jsonLinter]}
                        theme={materialDark}
                        editable={editMode}
                        readOnly={!editMode}
                        basicSetup={{
                          lineNumbers: false,
                          foldGutter: true,
                          highlightActiveLine: false,
                          highlightActiveLineGutter: false,
                          highlightSelectionMatches: false,
                        }}
                      />
                      <ResizeHandle
                        style={{ bottom: handlePosition }}
                        onMouseDown={handleMouseDown}
                      >
                        <FontAwesomeIcon icon={faUpDown} />
                      </ResizeHandle>
                    </CodeMirrorWrapper>
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
              placeholder={t("page.view_dream.render_duration")}
              type="text"
              before={<FontAwesomeIcon icon={faStopwatch} />}
              tooltipPlace={tooltipPlaces.right}
              {...register("render_duration")}
            />
          </FormItem>
          {!isImageDream && (
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
          )}
          <FormItem>
            <FormInput
              disabled
              placeholder={t("page.view_dream.resolution")}
              type="text"
              before={<FontAwesomeIcon icon={faDesktop} />}
              tooltipPlace={tooltipPlaces.left}
              {...register("processedMediaResolution")}
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
          {!isImageDream && (
            <>
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
            </>
          )}
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

type DreamImageInputProps = {
  isLoading?: boolean;
  dream?: Dream;
  image: MultiMediaState;
  editMode: boolean;
  isRemoved: boolean;
  handleChange: HandleChangeFile;
};

export const DreamImageInput: React.FC<DreamImageInputProps> = ({
  isLoading,
  dream,
  image,
  editMode,
  isRemoved,
  handleChange,
}) => {
  const { t } = useTranslation();
  const hasImage = Boolean(dream?.original_video) || image;

  if (!hasImage && (!editMode || isLoading)) {
    return (
      <VideoPlaceholder>
        <FontAwesomeIcon icon={faImage} />
      </VideoPlaceholder>
    );
  }

  return (
    <>
      {hasImage && !isRemoved ? (
        <img
          src={image?.url || dream?.original_video}
          alt={dream?.name || "Original image"}
          style={{ maxWidth: "100%", height: "auto" }}
        />
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
