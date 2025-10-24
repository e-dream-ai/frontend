import queryClient from "@/api/query-client";
import { PLAYLIST_QUERY_KEY } from "@/api/playlist/query/usePlaylist";
import { PLAYLIST_ITEMS_QUERY_KEY } from "@/api/playlist/query/usePlaylistItems";
import { PLAYLIST_KEYFRAMES_QUERY_KEY } from "@/api/playlist/query/usePlaylistKeyframes";
import { UpdatePlaylistFormValues } from "@/schemas/update-playlist.schema";
import { useUpdatePlaylist } from "@/api/playlist/mutation/useUpdatePlaylist";
import { toast } from "react-toastify";
import { SetStateAction, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { UseFormReset } from "react-hook-form";
import { useUpdateThumbnailPlaylist } from "@/api/playlist/mutation/useUpdateThumbnailPlaylist";
import { HandleChangeFile, MultiMediaState } from "@/types/media.types";
import { TOAST_DEFAULT_CONFIG } from "@/constants/toast.constants";
import { ItemOrder, SetItemOrder } from "@/types/dnd.types";
import {
  formatPlaylistRequest,
  getOrderedItemsPlaylistRequest,
  sortPlaylistItemsByDate,
  sortPlaylistItemsByName,
} from "@/utils/playlist.util";
import { useOrderPlaylist } from "@/api/playlist/mutation/useOrderPlaylist";
import { useDeletePlaylistItem } from "@/api/playlist/mutation/useDeletePlaylistItem";
import { useDeletePlaylistKeyframe } from "@/api/playlist/mutation/useDeletePlaylistKeyframe";
import { Playlist, PlaylistItem } from "@/types/playlist.types";
import { User } from "@/types/auth.types";
import { useDeletePlaylist } from "@/api/playlist/mutation/useDeletePlaylist";
import { useUploadDreamVideo } from "@/api/dream/hooks/useUploadDreamVideo";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import router from "@/routes/router";
import { FULL_CREATE_ROUTES, ROUTES } from "@/constants/routes.constants";
import { FileState } from "@/constants/file.constants";
import { getFileNameWithoutExtension } from "@/utils/file-uploader.util";
import useSocket from "@/hooks/useSocket";
import { emitPlayPlaylist } from "@/utils/socket.util";
import { createAddFileHandler } from "@/utils/file.util";
import useAuth from "@/hooks/useAuth";
import { isAdmin } from "@/utils/user.util";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";

type HookParams = {
  uuid?: string;
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
  fetchNextPlaylistItemsPage: () => void;
  hasNextPlaylistItemsPage: boolean | undefined;
  fetchNextPlaylistKeyframesPage: () => void;
  hasNextPlaylistKeyframesPage: boolean | undefined;
  playlistItemsTotalCount: number;
  playlistKeyframesTotalCount: number;
  playlistKeyframes: any[];
  isJumpingToEnd: boolean;
  setIsJumpingToEnd: (value: SetStateAction<boolean>) => void;
  hasJumpedToEndItems: boolean;
  setHasJumpedToEndItems: (value: SetStateAction<boolean>) => void;
  hasJumpedToEndKeyframes: boolean;
  setHasJumpedToEndKeyframes: (value: SetStateAction<boolean>) => void;
};

type SortType = "name" | "date";

export const usePlaylistHandlers = ({
  uuid,
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
  playlistItemsTotalCount,
  playlistKeyframesTotalCount,
  isJumpingToEnd,
  setIsJumpingToEnd,
  setHasJumpedToEndItems,
  setHasJumpedToEndKeyframes,
}: HookParams) => {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const { user } = useAuth();

  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);

  const { mutate: mutatePlaylist, isLoading: isLoadingPlaylistMutation } =
    useUpdatePlaylist();

  const {
    mutate: mutateThumbnailPlaylist,
    isLoading: isLoadingThumbnailPlaylistMutation,
  } = useUpdateThumbnailPlaylist(playlist?.uuid);

  const orderPlaylistMutation = useOrderPlaylist(uuid);

  const { mutate: mutateDeletePlaylistItem } = useDeletePlaylistItem();
  const { mutate: mutateDeletePlaylistKeyframe } = useDeletePlaylistKeyframe();

  const { mutate: mutateDeletePlaylist, isLoading: isLoadingDeletePlaylist } =
    useDeletePlaylist();

  const {
    isLoading: isUploadingSingleFile,
    uploadProgress,
    mutateAsync: uploadDreamVideoMutateAsync,
  } = useUploadDreamVideo({ navigateToDream: false });

  const addPlaylistItemMutation = useAddPlaylistItem();

  const isLoading =
    isLoadingPlaylistMutation ||
    isLoadingThumbnailPlaylistMutation ||
    isUploadingSingleFile;

  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    setEditMode(true);
  };

  const handleMutatePlaylist = (data: UpdatePlaylistFormValues) => {
    mutatePlaylist(formatPlaylistRequest(uuid!, data, isUserAdmin), {
      onSuccess: (response) => {
        if (response.success) {
          queryClient.setQueryData([PLAYLIST_QUERY_KEY, uuid], response);
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
    });
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
        { playlistUUID: playlist!.uuid, itemId },
        {
          onSuccess: (response) => {
            if (response.success) {
              queryClient.invalidateQueries([PLAYLIST_QUERY_KEY, uuid]);
              queryClient.invalidateQueries([PLAYLIST_ITEMS_QUERY_KEY, uuid]);
              queryClient.invalidateQueries([
                PLAYLIST_KEYFRAMES_QUERY_KEY,
                uuid,
              ]);
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

  const handleDeleteKeyframe =
    (playlistKeyframeId: number) => (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      const toastId = toast.loading(
        t("page.view_playlist.deleting_playlist_keyframe"),
      );
      mutateDeletePlaylistKeyframe(
        {
          playlistUUID: playlist!.uuid,
          playlistKeyframeId: playlistKeyframeId,
        },
        {
          onSuccess: (response) => {
            if (response.success) {
              // invalidates playlist query to bring new data without deleted keyframe
              queryClient.invalidateQueries([PLAYLIST_QUERY_KEY, uuid]);
              queryClient.invalidateQueries([PLAYLIST_ITEMS_QUERY_KEY, uuid]);
              queryClient.invalidateQueries([
                PLAYLIST_KEYFRAMES_QUERY_KEY,
                uuid,
              ]);
              toast.update(toastId, {
                render: t(
                  "page.view_playlist.playlist_keyframe_deleted_successfully",
                ),
                type: "success",
                isLoading: false,
                ...TOAST_DEFAULT_CONFIG,
              });
            } else {
              toast.update(toastId, {
                render: `${t(
                  "page.view_playlist.error_deleting_playlist_keyframe",
                )} ${response.message}`,
                type: "error",
                isLoading: false,
                ...TOAST_DEFAULT_CONFIG,
              });
            }
          },
          onError: () => {
            toast.update(toastId, {
              render: `${t(
                "page.view_playlist.error_deleting_playlist_keyframe",
              )}`,
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
        uuid: playlist!.uuid,
        values: {
          order: requestPlaylistItems,
        },
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
        uuid: playlist!.uuid,
        values: {
          order: orderedItems,
        },
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

  const handleFileUploaderChange: HandleChangeFile = createAddFileHandler({
    setFiles: setVideos,
  });

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
          playlistUUID: playlist!.uuid,
          values: {
            type: "dream",
            uuid: createdDream.uuid,
          },
        });
      }
    }
    setIsUploadingFiles(false);
  };

  const handleDeleteVideo = (index: number) => () =>
    setVideos((videos) => videos.filter((_, i) => i !== index));

  const handleConfirmDeletePlaylist = () => {
    mutateDeletePlaylist(uuid!, {
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
      playlist: String(playlist?.uuid ?? ""),
      playlistName: String(playlist?.name ?? ""),
    }).toString();

    router.navigate(
      `${FULL_CREATE_ROUTES.ADD_ITEM_TO_PLAYLIST}?${queryParams}`,
    );
  };

  const handleNavigateAddKeyframeToPlaylist = () => {
    const queryParams = new URLSearchParams({
      playlist: String(playlist?.uuid ?? ""),
      playlistName: String(playlist?.name ?? ""),
    }).toString();

    router.navigate(
      `${FULL_CREATE_ROUTES.ADD_KEYFRAME_TO_PLAYLIST}?${queryParams}`,
    );
  };

  const handleJumpToEndItems = async () => {
    if (isJumpingToEnd) return;

    setIsJumpingToEnd(true);

    try {
      // Make a single API call to get ALL items
      const response = await axiosClient.get(`/v1/playlist/${uuid}/items`, {
        params: {
          take: playlistItemsTotalCount,
          skip: 0,
        },
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      });

      if (response.data.success) {
        // Replace the query cache with all items in a single page
        queryClient.setQueryData([PLAYLIST_ITEMS_QUERY_KEY, uuid], {
          pages: [
            {
              data: {
                items: response.data.data.items,
                totalCount: playlistItemsTotalCount,
              },
            },
          ],
          pageParams: [0],
        });
      }

      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 100);

      // Mark that we've jumped to end for items
      setHasJumpedToEndItems(true);

      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }, 200);
    } finally {
      setIsJumpingToEnd(false);
    }
  };

  const handleJumpToEndKeyframes = async () => {
    if (isJumpingToEnd) return;

    setIsJumpingToEnd(true);

    try {
      // Make a single API call to get ALL keyframes
      const response = await axiosClient.get(`/v1/playlist/${uuid}/keyframes`, {
        params: {
          take: playlistKeyframesTotalCount,
          skip: 0,
        },
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      });

      if (response.data.success) {
        // Replace the query cache with all keyframes in a single page
        queryClient.setQueryData([PLAYLIST_KEYFRAMES_QUERY_KEY, uuid], {
          pages: [
            {
              data: {
                keyframes: response.data.data.keyframes,
                totalCount: playlistKeyframesTotalCount,
              },
            },
          ],
          pageParams: [0],
        });
      }

      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 100);

      setHasJumpedToEndKeyframes(true);

      // Scroll to the bottom after loading all keyframes
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }, 200);
    } finally {
      setIsJumpingToEnd(false);
    }
  };

  return {
    isLoading,
    uploadProgress,
    isLoadingDeletePlaylist,
    handleEdit,
    handleMutatePlaylist,
    handleMutateThumbnailPlaylist,
    handleDeletePlaylistItem,
    handleDeleteKeyframe,
    handleOrderPlaylist,
    handleOrderPlaylistBy,
    handleFileUploaderChange,
    handleUploadVideos,
    handleDeleteVideo,
    handleConfirmDeletePlaylist,
    handlePlayPlaylist,
    handleNavigateAddToPlaylist,
    handleNavigateAddKeyframeToPlaylist,
    handleJumpToEndItems,
    handleJumpToEndKeyframes,
  };
};
