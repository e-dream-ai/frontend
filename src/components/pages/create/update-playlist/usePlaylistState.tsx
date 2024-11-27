import { useState, useMemo, useEffect, useRef } from "react";
import { FileState } from "@/constants/file.constants";
import { User } from "@/types/auth.types";
import { isAdmin } from "@/utils/user.util";
import useAuth from "@/hooks/useAuth";
import { usePlaylists } from "@/api/playlist/query/usePlaylists";
import { Control, UseFormSetValue } from "react-hook-form";
import { UpdateVideoPlaylistFormValues } from "@/schemas/update-playlist.schema";
import { useWatch } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { usePlaylist } from "@/api/playlist/query/usePlaylist";
import { Playlist } from "@/types/playlist.types";

type Props = {
  control: Control<UpdateVideoPlaylistFormValues>;
  setValue: UseFormSetValue<UpdateVideoPlaylistFormValues>;
};

export const usePlaylistState = ({ control, setValue }: Props) => {
  const { user } = useAuth();
  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const [params] = useSearchParams();
  const hasSetDefaultValue = useRef(false);
  
  /**
   * Default playlist from navigation
   */
  const defaultPlaylistUUID = params.get("playlist") ?? undefined;
  const defaultPlaylistQuery = usePlaylist(defaultPlaylistUUID);

  /**
   * Selected playlist state
   */
  const [playlist, setPlaylist] = useState<Playlist>();
  const [playlistSearch, setPlaylistSearch] = useState<string>("");
  const [videos, setVideos] = useState<FileState[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [currentUploadFile, setCurrentUploadFile] = useState(0);
  const formValues = useWatch({ control });
  const selectedPlaylistUUID = useMemo(
    () => formValues?.playlist?.value,
    [formValues],
  );

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
   * playlists options data
   */

  const { data: playlistsData, isLoading: isPlaylistsLoading } = usePlaylists({
    search: playlistSearch,
    scope: isUserAdmin ? "all-on-search" : "user-only",
  });

  /**
   * Playlists from search to fill select
   */
  const playlists = useMemo(
    () => playlistsData?.data?.playlists ?? [],
    [playlistsData],
  );

  /**
   * Select playlists options
   */
  const playlistsOptions = useMemo(() => {
    const options = (playlistsData?.data?.playlists ?? [])
      .filter((playlist) => playlist.name)
      .map((playlist) => ({
        label: playlist?.name ?? "-",
        value: playlist?.uuid,
      }));

    return options;
  }, [playlistsData]);

  /**
   * Sets default playlist if there's a value from navigation
   */
  useEffect(() => {
    if (
      defaultPlaylistQuery.isFetched &&
      defaultPlaylistQuery.data?.data?.playlist &&
      !hasSetDefaultValue.current
    ) {
      const dp = defaultPlaylistQuery.data.data.playlist;
      setValue("playlist", {
        label: dp.name,
        value: dp.uuid,
      });
      setPlaylist(dp);
      hasSetDefaultValue.current = true;
    } else if (!defaultPlaylistQuery.isLoading) {
      hasSetDefaultValue.current = true;
    }
  }, [setValue, defaultPlaylistQuery]);

  return {
    playlistUUID: selectedPlaylistUUID,
    playlists,
    playlist,
    isPlaylistsLoading: isPlaylistsLoading || defaultPlaylistQuery.isLoading,
    playlistsOptions,
    isUserAdmin,
    playlistSearch,
    videos,
    isUploadingFiles,
    currentUploadFile,
    totalVideos,
    totalUploadedVideos,
    totalUploadedVideosPercentage,
    setPlaylist,
    setCurrentUploadFile,
    setIsUploadingFiles,
    setVideos,
    setPlaylistSearch,
  };
};
