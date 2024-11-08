import {
  Button,
  FileUploader,
  Row,
  Text,
  Column,
  AnchorLink,
  Checkbox,
} from "@/components/shared";
import { UploadVideosProgress } from "@/components/shared/upload-videos-progress/upload-videos-progress";
import { VideoList } from "@/components/shared/video-list/video-list";
import {
  ALLOWED_VIDEO_TYPES,
  MAX_FILE_SIZE_MB,
} from "@/constants/file.constants";
import { useTranslation } from "react-i18next";
import { usePlaylistState } from "./usePlaylistState";
import { usePlaylistHandlers } from "./usePlaylistHandlers";
import {
  handleFileUploaderSizeError,
  handleFileUploaderTypeError,
} from "@/utils/file-uploader.util";
import {
  UpdateVideoPlaylistFormValues,
  UpdateVideoPlaylistSchema,
} from "@/schemas/update-playlist.schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import Select from "@/components/shared/select/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faUpload } from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "@/constants/routes.constants";

export const UpdatePlaylist: React.FC = () => {
  const { t } = useTranslation();

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    getValues,
    setValue,
    register,
  } = useForm<UpdateVideoPlaylistFormValues>({
    resolver: yupResolver(UpdateVideoPlaylistSchema),
  });

  const {
    playlistUUID,
    playlist,
    playlistsOptions,
    isPlaylistsLoading,
    setPlaylistSearch,
    videos,
    setVideos,
    isUploadingFiles,
    setIsUploadingFiles,
    currentUploadFile,
    setCurrentUploadFile,
    totalVideos,
    totalUploadedVideos,
    totalUploadedVideosPercentage,
  } = usePlaylistState({ getValues, setValue });

  const {
    isLoading,
    uploadProgress,
    handleFileUploaderChange,
    handleUploadVideos,
    handleDeleteVideo,
  } = usePlaylistHandlers({
    playlistUUID,
    playlist,
    videos,
    reset,
    setCurrentUploadFile,
    setVideos,
    setIsUploadingFiles,
  });

  const onSubmit = async (formData: UpdateVideoPlaylistFormValues) => {
    try {
      if (totalVideos === 0) {
        setIsUploadingFiles(false);
      } else {
        setIsUploadingFiles(true);
        await handleUploadVideos({ nsfw: formData?.nsfw });
      }
    } catch (error) {
      console.error(error);
      setIsUploadingFiles(false);
      toast.error(t("components.update_playlist.error_updating_playlist"));
    }
  };

  return (
    <>
      <form style={{ minWidth: "320px" }} onSubmit={handleSubmit(onSubmit)}>
        <Column>
          <Text marginY={3}>
            {t("components.update_playlist.update_playlist_instructions")}
          </Text>
          <Controller
            name="playlist"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder={t("components.update_playlist.playlist")}
                isLoading={isPlaylistsLoading}
                before={<FontAwesomeIcon icon={faList} />}
                options={playlistsOptions}
                onInputChange={(newValue) => setPlaylistSearch(newValue)}
                error={errors.playlist?.label?.message}
                isDisabled={isUploadingFiles}
              />
            )}
          />

          <Row mt={4}>
            <Text>{t("components.update_playlist.upload_file")}</Text>
          </Row>

          <VideoList
            videos={videos}
            isUploadingVideos={isLoading}
            handleDeleteVideo={handleDeleteVideo}
          />

          <FileUploader
            multiple
            maxSize={MAX_FILE_SIZE_MB}
            handleChange={handleFileUploaderChange}
            onSizeError={handleFileUploaderSizeError(t)}
            onTypeError={handleFileUploaderTypeError(t)}
            name="file"
            types={ALLOWED_VIDEO_TYPES}
          />

          <UploadVideosProgress
            isUploading={isUploadingFiles}
            totalVideos={totalVideos}
            totalUploadedVideos={totalUploadedVideos}
            totalUploadedVideosPercentage={totalUploadedVideosPercentage}
            currentUploadFile={currentUploadFile}
            uploadProgress={uploadProgress}
          />

          <Row my={4} justifyContent="space-between">
            <Column>
              <Checkbox {...register("nsfw")} error={errors.nsfw?.message}>
                {t("page.create.nsfw_dream")}
              </Checkbox>
              <div data-tooltip-id="ccby-license">
                <Checkbox
                  {...register("ccbyLicense")}
                  error={errors.ccbyLicense?.message}
                >
                  {t("page.create.ccby_license_dream")}
                </Checkbox>
              </div>
            </Column>
            <Column>
              <Button
                type="submit"
                after={<FontAwesomeIcon icon={faUpload} />}
                isLoading={isLoading || isUploadingFiles}
                disabled={!videos.length}
              >
                {isLoading
                  ? t("components.update_playlist.adding")
                  : t("components.update_playlist.add")}
              </Button>
            </Column>
          </Row>

          <Row my={4}>
            <Text>
              {t("page.create.content_policy")} {""}
              <AnchorLink
                style={{ textDecoration: "underline" }}
                to={ROUTES.TERMS_OF_SERVICE}
              >
                {t("page.create.terms_of_service")}
              </AnchorLink>
              .
            </Text>
          </Row>
        </Column>
      </form>
    </>
  );
};
