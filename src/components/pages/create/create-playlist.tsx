import { useState } from "react";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";
import { faList } from "@fortawesome/free-solid-svg-icons";
import { useCreatePlaylist } from "@/api/playlist/mutation/useCreatePlaylist";
import {
  AnchorLink,
  Button,
  Checkbox,
  FileUploader,
  Input,
  Row,
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
  getFileState,
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
import { useUploadDreamVideo } from "@/api/dream/hooks/useUploadDreamVideo";
import { Playlist } from "@/types/playlist.types";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import Restricted from "@/components/shared/restricted/restricted";
import { DREAM_PERMISSIONS } from "@/constants/permissions.constants";
import { VideoList } from "@/components/shared/video-list/video-list";
import { UploadVideosProgress } from "@/components/shared/upload-videos-progress/upload-videos-progress";
export const CreatePlaylist: React.FC = () => {
  const { t } = useTranslation();
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

  const handleChange: HandleChangeFile = (files) => {
    if (files instanceof FileList) {
      const filesArray = Array.from(files);
      setVideos((v) => [...v, ...filesArray.map((f) => getFileState(f))]);
    } else {
      setVideos((v) => [...v, getFileState(files)]);
    }
  };

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

  const handleUploadVideos = async (playlist: Playlist) => {
    for (let i = 0; i < videos.length; i++) {
      setCurrentUploadFile(i);
      const createdDream = await mutateAsync({ file: videos[i]?.fileBlob });
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
        handleUploadVideos(playlist);
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

        <Row my={0}>
          <Checkbox {...register("nsfw")} error={errors.nsfw?.message}>
            {t("page.create.nsfw_playlist")}
          </Checkbox>
        </Row>

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
          <Text my={3}>{t("page.create.playlist_file_instructions")}</Text>
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

        <Row my={4} justifyContent="flex-end">
          <Button isLoading={isLoading}>
            {isLoading ? t("page.create.creating") : t("page.create.create")}
          </Button>
        </Row>
      </Column>
    </form>
  );
};
