import { NSFW } from "@/constants/dream.constants";
import queryClient from "@/api/query-client";
import { PLAYLIST_QUERY_KEY } from "@/api/playlist/query/usePlaylist";
import { UpdatePlaylistFormValues } from "@/schemas/update-playlist.schema";
import { useUpdatePlaylist } from "@/api/playlist/mutation/useUpdatePlaylist";
import { toast } from "react-toastify";
import { SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { UseFormReset } from "react-hook-form";
import { useUpdateThumbnailPlaylist } from "@/api/playlist/mutation/useUpdateThumbnailPlaylist";
import { HandleChangeFile, MultiMediaState } from "@/types/media.types";
import { TOAST_DEFAULT_CONFIG } from "@/constants/toast.constants";
import { ItemOrder, SetItemOrder } from "@/types/dnd.types";
import {
  getOrderedItemsPlaylistRequest,
  sortPlaylistItemsByDate,
  sortPlaylistItemsByName,
} from "@/utils/playlist.util";
import { useOrderPlaylist } from "@/api/playlist/mutation/useOrderPlaylist";
import { useDeletePlaylistItem } from "@/api/playlist/mutation/useDeletePlaylistItem";
import { Playlist, PlaylistItem } from "@/types/playlist.types";
import { useDeletePlaylist } from "@/api/playlist/mutation/useDeletePlaylist";
import { useUploadDreamVideo } from "@/api/dream/hooks/useUploadDreamVideo";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import router from "@/routes/router";
import { FULL_CREATE_ROUTES, ROUTES } from "@/constants/routes.constants";
import { FileState } from "@/constants/file.constants";
import {
  getFileNameWithoutExtension,
  getFileState,
} from "@/utils/file-uploader.util";
import useSocket from "@/hooks/useSocket";
import { emitPlayPlaylist } from "@/utils/socket.util";

type HookParams = {
  playlistId?: number;
  playlist: Playlist | undefined;
  items: PlaylistItem[];
  thumbnail: MultiMediaState;
  isThumbnailRemoved: boolean;
  videos: FileState[];
  reset: UseFormReset<UpdatePlaylistFormValues>;
  setEditMode: (value: SetStateAction<boolean>) => void;
  setCurrentUploadFile: (value: SetStateAction<number>) => void;
  setVideos: (value: SetStateAction<FileState[]>) => void;
  setIsUploadingFiles: (value: SetStateAction<boolean>) => void;
  onHideConfirmDeleteModal: () => void;
};

type SortType = "name" | "date";

export const usePlaylistHandlers = ({
  playlistId,
  playlist,
  items,
  thumbnail,
  isThumbnailRemoved,
  videos,
  reset,
  setEditMode,
  setCurrentUploadFile,
  setVideos,
  setIsUploadingFiles,
  onHideConfirmDeleteModal,
}: HookParams) => {
  const { t } = useTranslation();
  const { socket } = useSocket();

  const { mutate: mutatePlaylist, isLoading: isLoadingPlaylistMutation } =
    useUpdatePlaylist(playlistId);

  const {
    mutate: mutateThumbnailPlaylist,
    isLoading: isLoadingThumbnailPlaylistMutation,
  } = useUpdateThumbnailPlaylist(playlistId);

  const orderPlaylistMutation = useOrderPlaylist(playlistId);

  const { mutate: mutateDeletePlaylistItem } =
    useDeletePlaylistItem(playlistId);

  const { mutate: mutateDeletePlaylist, isLoading: isLoadingDeletePlaylist } =
    useDeletePlaylist(playlistId);

  const {
    isLoading: isUploadingSingleFile,
    uploadProgress,
    mutateAsync: uploadDreamVideoMutateAsync,
  } = useUploadDreamVideo({ navigateToDream: false });

  const addPlaylistItemMutation = useAddPlaylistItem(playlist?.id);

  const isLoading =
    isLoadingPlaylistMutation ||
    isLoadingThumbnailPlaylistMutation ||
    isUploadingSingleFile;

  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    setEditMode(true);
  };

  const handleMutatePlaylist = (data: UpdatePlaylistFormValues) => {
    mutatePlaylist(
      {
        name: data.name,
        featureRank: data?.featureRank,
        displayedOwner: data?.displayedOwner?.value,
        nsfw: data?.nsfw.value === NSFW.TRUE,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            queryClient.setQueryData(
              [PLAYLIST_QUERY_KEY, playlistId],
              response,
            );
            reset({ name: response?.data?.playlist.name });
            toast.success(
              `${t("page.view_playlist.playlist_updated_successfully")}`,
            );
            setEditMode(false);
          } else {
            toast.error(
              `${t("page.view_playlist.error_updating_playlist")} ${
                response.message
              }`,
            );
          }
        },
        onError: () => {
          toast.error(t("page.view_playlist.error_updating_playlist"));
        },
      },
    );
  };

  const handleMutateThumbnailPlaylist = (data: UpdatePlaylistFormValues) => {
    if (isThumbnailRemoved || thumbnail?.file) {
      mutateThumbnailPlaylist(
        { file: thumbnail?.file as Blob },
        {
          onSuccess: (response) => {
            if (response.success) {
              handleMutatePlaylist(data);
            } else {
              toast.error(
                `${t("page.view_playlist.error_updating_playlist")} ${
                  response.message
                }`,
              );
            }
          },
          onError: () => {
            toast.error(t("page.view_playlist.error_updating_playlist"));
          },
        },
      );
    } else {
      handleMutatePlaylist(data);
    }
  };

  const handleDeletePlaylistItem =
    (itemId: number) => (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      const toastId = toast.loading(
        t("page.view_playlist.deleting_playlist_item"),
      );
      mutateDeletePlaylistItem(
        { itemId },
        {
          onSuccess: (response) => {
            if (response.success) {
              queryClient.invalidateQueries([PLAYLIST_QUERY_KEY, playlistId]);
              toast.update(toastId, {
                render: t(
                  "page.view_playlist.playlist_item_deleted_successfully",
                ),
                type: "success",
                isLoading: false,
                ...TOAST_DEFAULT_CONFIG,
              });
            } else {
              toast.update(toastId, {
                render: `${t(
                  "page.view_playlist.error_deleting_playlist_item",
                )} ${response.message}`,
                type: "error",
                isLoading: false,
                ...TOAST_DEFAULT_CONFIG,
              });
            }
          },
          onError: () => {
            toast.update(toastId, {
              render: `${t("page.view_playlist.error_deleting_playlist_item")}`,
              type: "error",
              isLoading: false,
              ...TOAST_DEFAULT_CONFIG,
            });
          },
        },
      );
    };

  const handleOrderPlaylist = async (dropItem: SetItemOrder) => {
    /**
     * Validate new index value
     */
    if (dropItem.newIndex < 0) {
      dropItem.newIndex = 0;
    } else if (dropItem.newIndex > items.length - 1) {
      dropItem.newIndex = items.length - 1;
    }

    const requestPlaylistItems: ItemOrder[] = getOrderedItemsPlaylistRequest({
      items: items.map((i) => ({ id: i.id, order: i.order }) as ItemOrder),
      dropItem,
    });

    const toastId = toast.loading(
      t("page.view_playlist.ordering_playlist_items"),
    );
    try {
      const response = await orderPlaylistMutation.mutateAsync({
        order: requestPlaylistItems,
      });

      if (response.success) {
        toast.update(toastId, {
          render: t("page.view_playlist.playlist_items_ordered_successfully"),
          type: "success",
          isLoading: false,
          ...TOAST_DEFAULT_CONFIG,
        });
      } else {
        toast.update(toastId, {
          render: `${t("page.view_playlist.error_ordering_playlist_items")} ${
            response.message
          }`,
          type: "error",
          isLoading: false,
          ...TOAST_DEFAULT_CONFIG,
        });
      }
    } catch (_) {
      toast.update(toastId, {
        render: `${t("page.view_playlist.error_ordering_playlist_items")}`,
        type: "error",
        isLoading: false,
        ...TOAST_DEFAULT_CONFIG,
      });
    }
  };

  const handleOrderPlaylistBy = (type: SortType) => async () => {
    const items = playlist?.items;
    let orderedItems;
    if (type === "name") orderedItems = sortPlaylistItemsByName(items);
    else orderedItems = sortPlaylistItemsByDate(items);

    if (!orderedItems) {
      return;
    }

    const toastId = toast.loading(
      t("page.view_playlist.ordering_playlist_items"),
    );
    try {
      const response = await orderPlaylistMutation.mutateAsync({
        order: orderedItems,
      });

      if (response.success) {
        toast.update(toastId, {
          render: t("page.view_playlist.playlist_items_ordered_successfully"),
          type: "success",
          isLoading: false,
          ...TOAST_DEFAULT_CONFIG,
        });
      } else {
        toast.update(toastId, {
          render: `${t("page.view_playlist.error_ordering_playlist_items")} ${
            response.message
          }`,
          type: "error",
          isLoading: false,
          ...TOAST_DEFAULT_CONFIG,
        });
      }
    } catch (_) {
      toast.update(toastId, {
        render: `${t("page.view_playlist.error_ordering_playlist_items")}`,
        type: "error",
        isLoading: false,
        ...TOAST_DEFAULT_CONFIG,
      });
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
          `"${fileName}" ${t("page.view_playlist.dream_already_exists")}`,
        );
        continue;
      }

      const createdDream = await uploadDreamVideoMutateAsync({
        file: videos[i]?.fileBlob,
      });
      setVideoUploaded(i);
      if (createdDream) {
        await addPlaylistItemMutation.mutateAsync({
          type: "dream",
          id: String(createdDream.id),
        });
      }
    }
    setIsUploadingFiles(false);
  };

  const handleDeleteVideo = (index: number) => () =>
    setVideos((videos) => videos.filter((_, i) => i !== index));

  const handleConfirmDeletePlaylist = () => {
    mutateDeletePlaylist(null, {
      onSuccess: (response) => {
        if (response.success) {
          toast.success(
            `${t("page.view_playlist.playlist_deleted_successfully")}`,
          );
          onHideConfirmDeleteModal();
          router.navigate(ROUTES.FEED);
        } else {
          toast.error(
            `${t("page.view_playlist.error_deleting_playlist")} ${
              response.message
            }`,
          );
        }
      },
      onError: () => {
        toast.error(t("page.view_playlist.error_deleting_playlist"));
      },
    });
  };

  const handlePlayPlaylist = () => {
    emitPlayPlaylist(
      socket,
      playlist,
      t("toasts.play_playlist", { name: playlist?.name }),
    );
  };

  const handleNavigateAddToPlaylist = () => {
    const queryParams = new URLSearchParams({
      playlistId: String(playlist?.id ?? ""),
      playlistName: String(playlist?.name ?? ""),
    }).toString();

    router.navigate(`${FULL_CREATE_ROUTES.ADD_TO_PLAYLIST}?${queryParams}`);
  };

  return {
    isLoading,
    uploadProgress,
    isLoadingDeletePlaylist,
    handleEdit,
    handleMutatePlaylist,
    handleMutateThumbnailPlaylist,
    handleDeletePlaylistItem,
    handleOrderPlaylist,
    handleOrderPlaylistBy,
    handleFileUploaderChange,
    handleUploadVideos,
    handleDeleteVideo,
    handleConfirmDeletePlaylist,
    handlePlayPlaylist,
    handleNavigateAddToPlaylist,
  };
};
