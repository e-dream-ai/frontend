import { useState, useMemo } from "react";
import { FileState } from "@/constants/file.constants";
import { User } from "@/types/auth.types";
import { isAdmin } from "@/utils/user.util";
import useAuth from "@/hooks/useAuth";
import { usePlaylists } from "@/api/playlist/query/usePlaylists";
import { UseFormGetValues } from "react-hook-form";
import { UpdateVideoPlaylistFormValues } from "@/schemas/update-playlist.schema";

type Props = { getValues: UseFormGetValues<UpdateVideoPlaylistFormValues> };

export const usePlaylistState = ({ getValues }: Props) => {
  const { user } = useAuth();
  const [playlistSearch, setPlaylistSearch] = useState<string>("");
  const [videos, setVideos] = useState<FileState[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [currentUploadFile, setCurrentUploadFile] = useState(0);
  const selectedPlaylistId = getValues()?.playlist?.value;

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

  const { data: playlistsData, isLoading: isPlaylistsLoading } = usePlaylists({
    search: playlistSearch,
  });

  const playlistsOptions = (playlistsData?.data?.playlists ?? [])
    .filter((playlist) => playlist.name)
    .map((playlist) => ({
      label: playlist?.name ?? "-",
      value: playlist?.id,
    }));

  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);

  const playlist = useMemo(
    () =>
      playlistsData?.data?.playlists?.find((p) => p.id === selectedPlaylistId),
    [playlistsData, selectedPlaylistId],
  );

  return {
    playlist,
    isPlaylistsLoading,
    playlistsOptions,
    isUserAdmin,
    playlistSearch,
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
  };
};
