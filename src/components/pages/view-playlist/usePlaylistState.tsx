import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { FileState } from "@/constants/file.constants";
import { MultiMediaState } from "@/types/media.types";
import { useParams } from "react-router-dom";
import { usePlaylist } from "@/api/playlist/query/usePlaylist";
import { useUsers } from "@/api/user/query/useUsers";
import { useImage } from "@/hooks/useImage";
import { User } from "@/types/auth.types";
import usePermission from "@/hooks/usePermission";
import { isAdmin } from "@/utils/user.util";
import { PLAYLIST_PERMISSIONS } from "@/constants/permissions.constants";
import useAuth from "@/hooks/useAuth";
import { usePlaylistReferences } from "@/api/playlist/query/usePlaylistReferences";
import { usePlaylistItems } from "@/api/playlist/query/usePlaylistItems";
import { usePlaylistKeyframes } from "@/api/playlist/query/usePlaylistKeyframes";

type Params = { uuid: string };

export const usePlaylistState = () => {
  const { user } = useAuth();
  const { uuid } = useParams<Params>();
  const [userSearch, setUserSearch] = useState<string>("");
  const [videos, setVideos] = useState<FileState[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [currentUploadFile, setCurrentUploadFile] = useState(0);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isThumbnailRemoved, setIsThumbnailRemoved] = useState<boolean>(false);
  const [thumbnail, setTumbnail] = useState<MultiMediaState>();
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] =
    useState<boolean>(false);
  const [searchValue, setSearchValue] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const search = useDebounce(searchValue.trim(), 300);

  /**
   * videos data
   */
  const totalVideos: number = videos.length;
  const totalUploadedVideos: number = videos.reduce(
    (prev, video) => prev + (video.uploaded ? 1 : 0),
    0,
  );
  const totalUploadedVideosPercentage = Math.round(
    (totalUploadedVideos / (totalVideos === 0 ? 1 : totalVideos)) * 100,
  );

  /**
   * API queries
   */
  const { data, isLoading, isError } = usePlaylist(uuid);
  const {
    data: playlistReferencesData,
    isLoading: isPlaylistReferencesLoading,
  } = usePlaylistReferences(uuid);
  const {
    data: playlistItemsData,
    isLoading: isPlaylistItemsLoading,
    fetchNextPage: fetchNextPlaylistItemsPage,
    hasNextPage: hasNextPlaylistItemsPage,
    isFetchingNextPage: isFetchingNextPlaylistItemsPage,
    isError: isPlaylistItemsError,
    refetch: refetchPlaylistItems,
  } = usePlaylistItems({ uuid, search, order });
  const {
    data: playlistKeyframesData,
    isLoading: isPlaylistKeyframesLoading,
    fetchNextPage: fetchNextPlaylistKeyframesPage,
    hasNextPage: hasNextPlaylistKeyframesPage,
    isFetchingNextPage: isFetchingNextPlaylistKeyframesPage,
    isError: isPlaylistKeyframesError,
    refetch: refetchPlaylistKeyframes,
  } = usePlaylistKeyframes({ uuid, search, order });
  const { data: usersData, isLoading: isUsersLoading } = useUsers({
    search: userSearch,
  });

  const playlist = useMemo(() => {
    const pl = data?.data?.playlist;
    if (!pl) return pl;

    return {
      ...pl,
      playlistItems: playlistReferencesData?.data?.references ?? [],
    };
  }, [data, playlistReferencesData]);

  const isPlaylistLoading = isLoading || isPlaylistReferencesLoading;

  const thumbnailUrl = useImage(playlist?.thumbnail, {
    width: 500,
    fit: "cover",
  });
  const usersOptions = (usersData?.data?.users ?? [])
    .filter((user) => user.name)
    .map((user) => ({
      label: user?.name ?? "-",
      value: user?.id,
    }));

  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const isOwner: boolean = useMemo(
    () => (user?.id ? user?.id === playlist?.user?.id : false),
    [playlist, user],
  );
  const allowedEditPlaylist = usePermission({
    permission: PLAYLIST_PERMISSIONS.CAN_DELETE_PLAYLIST,
    isOwner: isOwner,
  });

  const allowedEditOwner = usePermission({
    permission: PLAYLIST_PERMISSIONS.CAN_EDIT_OWNER,
    isOwner,
  });

  const allowedEditVisibility = usePermission({
    permission: PLAYLIST_PERMISSIONS.CAN_EDIT_VISIBILITY,
  });

  const items = useMemo(
    () =>
      playlistItemsData?.pages
        .flatMap((page) => page.data?.items ?? [])
        .sort((a, b) =>
          order === "desc" ? b.order - a.order : a.order - b.order,
        ) ?? [],
    [playlistItemsData?.pages, order],
  );

  const playlistItemsTotalCount = useMemo(
    () => playlistItemsData?.pages?.[0]?.data?.totalCount ?? 0,
    [playlistItemsData?.pages],
  );

  const playlistKeyframes = useMemo(
    () =>
      playlistKeyframesData?.pages
        .flatMap((page) => page.data?.keyframes ?? [])
        .sort((a, b) =>
          order === "desc" ? b.order - a.order : a.order - b.order,
        ) ?? [],
    [playlistKeyframesData?.pages, order],
  );

  const playlistKeyframesTotalCount = useMemo(
    () => playlistKeyframesData?.pages?.[0]?.data?.totalCount ?? 0,
    [playlistKeyframesData?.pages],
  );

  return {
    isError,
    uuid,
    playlist,
    isPlaylistLoading,
    isUsersLoading,
    thumbnailUrl,
    usersOptions,
    isUserAdmin,
    isOwner,
    allowedEditPlaylist,
    allowedEditOwner,
    allowedEditVisibility,
    items,
    playlistKeyframes,
    playlistItemsTotalCount,
    playlistKeyframesTotalCount,
    fetchNextPlaylistItemsPage,
    hasNextPlaylistItemsPage,
    fetchNextPlaylistKeyframesPage,
    hasNextPlaylistKeyframesPage,
    userSearch,
    setUserSearch,
    videos,
    setVideos,
    isUploadingFiles,
    setIsUploadingFiles,
    currentUploadFile,
    setCurrentUploadFile,
    editMode,
    setEditMode,
    isThumbnailRemoved,
    setIsThumbnailRemoved,
    thumbnail,
    setTumbnail,
    showConfirmDeleteModal,
    setShowConfirmDeleteModal,
    totalVideos,
    totalUploadedVideos,
    totalUploadedVideosPercentage,
    searchValue,
    setSearchValue,
    search,
    order,
    setOrder,
    isPlaylistItemsLoading,
    isPlaylistKeyframesLoading,
    isPlaylistItemsError,
    isPlaylistKeyframesError,
    refetchPlaylistItems,
    refetchPlaylistKeyframes,
    isFetchingNextPlaylistItemsPage,
    isFetchingNextPlaylistKeyframesPage,
  };
};
