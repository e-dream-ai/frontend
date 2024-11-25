import { useState, useMemo, useEffect, useCallback } from "react";
import { FileState } from "@/constants/file.constants";
import { User } from "@/types/auth.types";
import { isAdmin } from "@/utils/user.util";
import useAuth from "@/hooks/useAuth";
import { usePlaylists } from "@/api/playlist/query/usePlaylists";
import { Control, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { UpdateVideoPlaylistFormValues } from "@/schemas/update-playlist.schema";
import { useWatch } from "react-hook-form";
import { useLocation } from "react-router-dom";

type Props = {
  control: Control<UpdateVideoPlaylistFormValues>;
  getValues: UseFormGetValues<UpdateVideoPlaylistFormValues>;
  setValue: UseFormSetValue<UpdateVideoPlaylistFormValues>;
};

export const usePlaylistState = ({ control, setValue }: Props) => {
  const { user } = useAuth();
  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const location = useLocation();

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

  const playlist = useMemo(
    () =>
      playlistsData?.data?.playlists?.find(
        (p) => p.uuid === selectedPlaylistUUID,
      ),
    [playlistsData, selectedPlaylistUUID],
  );

  const getLocationParamPlaylist = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    const param1 = searchParams.get("playlist");
    const param2 = searchParams.get("playlistName");

    if (param1 && param2) {
      return {
        label: param2,
        value: param1,
      };
    }

    return undefined;
  }, [location.search]);

  const playlistsOptions = useMemo(() => {
    const options = (playlistsData?.data?.playlists ?? [])
      .filter((playlist) => playlist.name)
      .map((playlist) => ({
        label: playlist?.name ?? "-",
        value: playlist?.uuid,
      }));

    const paramPlaylist = getLocationParamPlaylist();

    if (
      paramPlaylist &&
      !options.find((o) => o.value === paramPlaylist.value)
    ) {
      options.push(paramPlaylist);
    }

    return options;
  }, [playlistsData, getLocationParamPlaylist]);

  useEffect(() => {
    const paramPlaylist = getLocationParamPlaylist();
    if (paramPlaylist) {
      setValue("playlist", paramPlaylist);
    }
  }, [getLocationParamPlaylist, setValue]);

  return {
    playlistUUID: selectedPlaylistUUID,
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
