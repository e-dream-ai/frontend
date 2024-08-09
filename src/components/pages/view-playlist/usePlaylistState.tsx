import { useState, useMemo } from "react";
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
   *
   */
  const { data, isLoading: isPlaylistLoading } = usePlaylist(uuid);
  const { data: usersData, isLoading: isUsersLoading } = useUsers({
    search: userSearch,
  });
  const playlist = data?.data?.playlist;
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

  const items = useMemo(
    () => playlist?.items?.sort((a, b) => a.order - b.order) ?? [],
    [playlist?.items],
  );

  return {
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
    items,
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
  };
};
