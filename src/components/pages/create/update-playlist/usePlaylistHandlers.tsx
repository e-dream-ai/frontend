import { NSFW } from "@/constants/dream.constants";
import queryClient from "@/api/query-client";
import { PLAYLIST_QUERY_KEY } from "@/api/playlist/query/usePlaylist";
import {
  UpdatePlaylistFormValues,
  UpdateVideoPlaylistFormValues,
} from "@/schemas/update-playlist.schema";
import { useUpdatePlaylist } from "@/api/playlist/mutation/useUpdatePlaylist";
import { toast } from "react-toastify";
import { SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { UseFormReset } from "react-hook-form";
import { HandleChangeFile } from "@/types/media.types";
import { Playlist } from "@/types/playlist.types";
import { useUploadDreamVideo } from "@/api/dream/hooks/useUploadDreamVideo";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import router from "@/routes/router";
import { ROUTES } from "@/constants/routes.constants";
import { FileState } from "@/constants/file.constants";
import {
  getFileNameWithoutExtension,
  getFileState,
} from "@/utils/file-uploader.util";

type HookParams = {
  playlistUUID?: string;
  playlist?: Playlist;
  videos: FileState[];
  reset: UseFormReset<UpdateVideoPlaylistFormValues>;
  setCurrentUploadFile: (value: SetStateAction<number>) => void;
  setVideos: (value: SetStateAction<FileState[]>) => void;
  setIsUploadingFiles: (value: SetStateAction<boolean>) => void;
};

export const usePlaylistHandlers = ({
  playlistUUID,
  playlist,
  videos,
  reset,
  setCurrentUploadFile,
  setVideos,
  setIsUploadingFiles,
}: HookParams) => {
  const { t } = useTranslation();

  const { mutate: mutatePlaylist, isLoading: isLoadingPlaylistMutation } =
    useUpdatePlaylist();

  const {
    isLoading: isUploadingSingleFile,
    uploadProgress,
    mutateAsync: uploadDreamVideoMutateAsync,
  } = useUploadDreamVideo({ navigateToDream: false });

  const addPlaylistItemMutation = useAddPlaylistItem();

  const isLoading = isLoadingPlaylistMutation || isUploadingSingleFile;

  const handleMutatePlaylist = (data: UpdatePlaylistFormValues) => {
    mutatePlaylist(
      {
        uuid: playlist!.uuid,
        values: {
          name: data.name,
          featureRank: data?.featureRank,
          displayedOwner: data?.displayedOwner?.value,
          nsfw: data?.nsfw.value === NSFW.TRUE,
        },
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            queryClient.setQueryData(
              [PLAYLIST_QUERY_KEY, playlistUUID],
              response,
            );
            reset({ playlist: undefined });
            toast.success(
              `${t(
                "components.update_playlist.playlist_updated_successfully",
              )}`,
            );
          } else {
            toast.error(
              `${t("components.update_playlist.error_updating_playlist")} ${
                response.message
              }`,
            );
          }
        },
        onError: () => {
          toast.error(t("components.update_playlist.error_updating_playlist"));
        },
      },
    );
  };

  const setVideoUploaded = (index: number) => {
    setVideos((videos) =>
      videos.map((v, i) => ({
        ...v,
        uploaded: i === index ? true : v.uploaded,
      })),
    );
  };

  const handleFileUploaderChange: HandleChangeFile = (files) => {
    if (files instanceof FileList) {
      const filesArray = Array.from(files);
      setVideos((v) => [...v, ...filesArray.map((f) => getFileState(f))]);
    } else {
      setVideos((v) => [...v, getFileState(files)]);
    }
  };

  const handleUploadVideos = async () => {
    const playlistDreamItemsNames = playlist?.items
      ?.filter((item) => Boolean(item?.dreamItem?.name))
      ?.map((item) => item.dreamItem!.name);

    for (let i = 0; i < videos.length; i++) {
      setCurrentUploadFile(i);

      const fileName = getFileNameWithoutExtension(videos[i]?.fileBlob);

      if (playlistDreamItemsNames?.includes(fileName)) {
        toast.warning(
          `"${fileName}" ${t(
            "components.update_playlist.dream_already_exists",
          )}`,
        );
        continue;
      }

      const createdDream = await uploadDreamVideoMutateAsync({
        file: videos[i]?.fileBlob,
      });
      setVideoUploaded(i);
      if (createdDream) {
        await addPlaylistItemMutation.mutateAsync({
          playlistUUID: playlistUUID!,
          values: {
            type: "dream",
            uuid: createdDream.uuid,
          },
        });
      }
    }

    router.navigate(`${ROUTES.VIEW_PLAYLIST}/${playlistUUID}`);
    setIsUploadingFiles(false);
  };

  const handleDeleteVideo = (index: number) => () =>
    setVideos((videos) => videos.filter((_, i) => i !== index));

  return {
    isLoading,
    uploadProgress,
    handleMutatePlaylist,
    handleFileUploaderChange,
    handleUploadVideos,
    handleDeleteVideo,
  };
};
