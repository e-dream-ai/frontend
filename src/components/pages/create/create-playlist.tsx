import { useState } from "react";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";
import { faList, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useCreatePlaylist } from "@/api/playlist/mutation/useCreatePlaylist";
import {
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
import ProgressBar from "@/components/shared/progress-bar/progress-bar";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import Restricted from "@/components/shared/restricted/restricted";
import { DREAM_PERMISSIONS } from "@/constants/permissions.constants";
export const CreatePlaylist: React.FC = () => {
  const { t } = useTranslation();
  const [videos, setVideos] = useState<FileState[]>([]);
  const [playlist, setPlaylist] = useState<Playlist>();
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
  const addPlaylistItemMutation = useAddPlaylistItem(playlist?.id);

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

  const handleUploadVideos = async (playlist?: Playlist) => {
    for (let i = 0; i < videos.length; i++) {
      setCurrentUploadFile(i);
      const createdDream = await mutateAsync({ file: videos[i]?.fileBlob });
      setVideoUploaded(i);
      if (createdDream) {
        await addPlaylistItemMutation.mutateAsync({
          type: "dream",
          id: String(createdDream.id),
        });
      }
    }
    setIsUploadingFiles(false);
    router.navigate(`${ROUTES.VIEW_PLAYLIST}/${playlist?.id}`);
  };

  const onSubmit = async (data: CreatePlaylistFormValues) => {
    try {
      setIsUploadingFiles(true);
      const playlistResponse = await mutateCreatePlaylist(data);
      const playlist = playlistResponse?.data?.playlist;
      setPlaylist(playlist);

      if (playlistResponse.success) {
        toast.success(t("page.create.playlist_successfully_created"));
      } else {
        setIsUploadingFiles(false);
        toast.error(t("page.create.error_creating_playlist"));
      }

      if (totalVideos === 0) {
        setIsUploadingFiles(false);
        router.navigate(`${ROUTES.VIEW_PLAYLIST}/${playlist?.id}`);
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
            {videos.map((v, i) => (
              <Row key={i} alignItems="center">
                <Text>{v.name}</Text>
                {!isLoading && (
                  <Button
                    type="button"
                    buttonType="danger"
                    transparent
                    ml="1rem"
                    onClick={onDeleteVideo(i)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                )}
              </Row>
            ))}
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

          {isUploadingFiles && (
            <>
              <Text my={3}>
                {t("page.create.playlist_file_count", {
                  current: totalUploadedVideos,
                  total: totalVideos,
                })}
              </Text>
              <ProgressBar completed={totalUploadedVideosPercentage} />
              <Text my={3}>
                {t("page.create.playlist_uploading_current_file", {
                  current: currentUploadFile + 1,
                })}
              </Text>
              <ProgressBar completed={uploadProgress} />
            </>
          )}
        </Restricted>

        <Row mt={4} justifyContent="flex-end">
          <Button isLoading={isLoading}>
            {isLoading ? t("page.create.creating") : t("page.create.create")}
          </Button>
        </Row>
      </Column>
    </form>
  );
};
