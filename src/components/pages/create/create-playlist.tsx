import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  faComment,
  faLink,
  faList,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { useCreatePlaylist } from "@/api/playlist/mutation/useCreatePlaylist";
import {
  AnchorLink,
  Button,
  Checkbox,
  FileUploader,
  Input,
  Row,
  TextArea,
} from "@/components/shared";
import { Column } from "@/components/shared/row/row";
import Text from "@/components/shared/text/text";
import { ROUTES } from "@/constants/routes.constants";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import router from "@/routes/router";
import CreatePlaylistSchema, {
  CreatePlaylistFormValues,
} from "@/schemas/create-playlist.schema";
import {
  handleFileUploaderSizeError,
  handleFileUploaderTypeError,
} from "@/utils/file-uploader.util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ALLOWED_VIDEO_TYPES,
  FileState,
  MAX_FILE_SIZE_MB,
} from "@/constants/file.constants";
import { HandleChangeFile } from "@/types/media.types";
import {
  generateDreamVideoFormRequest,
  useUploadDreamVideo,
} from "@/api/dream/hooks/useUploadDreamVideo";
import { Playlist } from "@/types/playlist.types";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import Restricted from "@/components/shared/restricted/restricted";
import {
  DREAM_PERMISSIONS,
  PLAYLIST_PERMISSIONS,
} from "@/constants/permissions.constants";
import { VideoList } from "@/components/shared/video-list/video-list";
import { UploadVideosProgress } from "@/components/shared/upload-videos-progress/upload-videos-progress";
import { Tooltip } from "react-tooltip";
import { createAddFileHandler } from "@/utils/file.util";
import { CCBY_ID } from "@/constants/terms-of-service";
import { CreateDreamFormValues } from "@/schemas/dream.schema";
import useAuth from "@/hooks/useAuth";
import { isAdmin } from "@/utils/user.util";
import { User } from "@/types/auth.types";
export const CreatePlaylist: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const [videos, setVideos] = useState<FileState[]>([]);
  const [currentUploadFile, setCurrentUploadFile] = useState(0);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const {
    mutateAsync: mutateCreatePlaylist,
    isLoading: isLoadingCreatePlaylist,
  } = useCreatePlaylist();

  const {
    isLoading: isUploadingSingleFile,
    uploadProgress,
    mutateAsync,
  } = useUploadDreamVideo({ navigateToDream: false });
  const addPlaylistItemMutation = useAddPlaylistItem();

  const isLoading =
    isUploadingFiles || isLoadingCreatePlaylist || isUploadingSingleFile;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePlaylistFormValues>({
    resolver: yupResolver(CreatePlaylistSchema),
  });

  const totalVideos: number = videos.length;
  const totalUploadedVideos: number = videos.reduce(
    (prev, video) => prev + (video.uploaded ? 1 : 0),
    0,
  );
  const totalUploadedVideosPercentage = Math.round(
    (totalUploadedVideos / (totalVideos === 0 ? 1 : totalVideos)) * 100,
  );

  const handleChange: HandleChangeFile = createAddFileHandler({
    setFiles: setVideos,
  });

  const setVideoUploaded = (index: number) => {
    setVideos((videos) =>
      videos.map((v, i) => ({
        ...v,
        uploaded: i === index ? true : v.uploaded,
      })),
    );
  };

  const onDeleteVideo = (index: number) => () =>
    setVideos((videos) => videos.filter((_, i) => i !== index));

  const handleUploadVideos = async (
    playlist: Playlist,
    data: CreateDreamFormValues,
  ) => {
    for (let i = 0; i < videos.length; i++) {
      setCurrentUploadFile(i);

      const createdDream = await mutateAsync(
        generateDreamVideoFormRequest(data, videos[i]?.fileBlob, isUserAdmin),
      );

      setVideoUploaded(i);
      if (createdDream) {
        await addPlaylistItemMutation.mutateAsync({
          playlistUUID: playlist!.uuid,
          values: {
            type: "dream",
            uuid: createdDream.uuid,
          },
        });
      }
    }
    setIsUploadingFiles(false);
    router.navigate(`${ROUTES.VIEW_PLAYLIST}/${playlist.uuid}`);
  };

  const onSubmit = async (data: CreatePlaylistFormValues) => {
    try {
      setIsUploadingFiles(true);
      const playlistResponse = await mutateCreatePlaylist(data);
      const playlist = playlistResponse?.data?.playlist;

      if (playlistResponse.success && playlist) {
        toast.success(t("page.create.playlist_successfully_created"));
      } else {
        setIsUploadingFiles(false);
        toast.error(t("page.create.error_creating_playlist"));
        return;
      }

      if (totalVideos === 0) {
        setIsUploadingFiles(false);
        router.navigate(`${ROUTES.VIEW_PLAYLIST}/${playlist?.uuid}`);
      } else {
        handleUploadVideos(playlist, {
          nsfw: data.nsfw ?? false,
          hidden: data.hidden ?? false,
          ccbyLicense: data.ccbyLicense ?? false,
          description: data.description,
          sourceUrl: data.sourceUrl,
        });
      }
    } catch (error) {
      setIsUploadingFiles(false);
      toast.error(t("page.create.error_creating_playlist"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Column>
        <Text marginY={3}>{t("page.create.playlist_instructions")}</Text>
        <Input
          placeholder={t("page.create.playlist_name")}
          type="text"
          before={<FontAwesomeIcon icon={faList} />}
          error={errors.name?.message}
          {...register("name")}
        />

        <Restricted to={DREAM_PERMISSIONS.CAN_CREATE_DREAM}>
          <>
            {Boolean(videos.length) && (
              <h3>{t("page.create.playlist_dreams")}</h3>
            )}

            <VideoList
              videos={videos}
              isUploadingVideos={isLoading}
              handleDeleteVideo={onDeleteVideo}
            />
          </>

          <Row mt={4}>
            <Text>{t("page.create.upload_file")}</Text>
          </Row>
          <FileUploader
            multiple
            maxSize={MAX_FILE_SIZE_MB}
            handleChange={handleChange}
            onSizeError={handleFileUploaderSizeError(t)}
            onTypeError={handleFileUploaderTypeError(t)}
            name="file"
            types={ALLOWED_VIDEO_TYPES}
          />

          {Boolean(totalVideos) && isUploadingFiles && (
            <UploadVideosProgress
              isUploading={isUploadingFiles}
              totalVideos={totalVideos}
              totalUploadedVideos={totalUploadedVideos}
              totalUploadedVideosPercentage={totalUploadedVideosPercentage}
              currentUploadFile={currentUploadFile}
              uploadProgress={uploadProgress}
            />
          )}
        </Restricted>

        <Row my={4} justifyContent="space-between">
          <Column flex="auto">
            <Checkbox {...register("nsfw")} error={errors.nsfw?.message}>
              {t("page.create.nsfw_playlist")}
            </Checkbox>
            <Restricted to={PLAYLIST_PERMISSIONS.CAN_EDIT_VISIBILITY}>
              <Checkbox {...register("hidden")} error={errors.hidden?.message}>
                {t("page.create.hidden_playlist")}
              </Checkbox>
            </Restricted>
            <div data-tooltip-id="ccby-license">
              <Checkbox
                {...register("ccbyLicense")}
                error={errors.ccbyLicense?.message}
              >
                <Tooltip
                  id="ccby-license"
                  place="right-end"
                  content={t("page.create.ccby_license_dream_tooltip")}
                />
                {t("page.create.license_dream")}
                <AnchorLink to={`${ROUTES.TERMS_OF_SERVICE}#${CCBY_ID}`}>
                  {t("page.create.license_dream_ccby")}
                </AnchorLink>
              </Checkbox>
            </div>
            <TextArea
              placeholder={t("page.create.dream_description")}
              before={<FontAwesomeIcon icon={faComment} />}
              error={errors.description?.message}
              {...register("description")}
            />
            <Input
              placeholder={t("page.create.dream_source_url")}
              type="text"
              before={<FontAwesomeIcon icon={faLink} />}
              error={errors.sourceUrl?.message}
              {...register("sourceUrl")}
            />
          </Column>
        </Row>
        <Row justifyContent="flex-end">
          <Button
            isLoading={isLoading}
            after={<FontAwesomeIcon icon={faUpload} />}
          >
            {isLoading ? t("page.create.creating") : t("page.create.create")}
          </Button>
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
  );
};
