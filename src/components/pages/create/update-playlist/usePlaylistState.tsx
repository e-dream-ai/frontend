import { useState, useMemo, useEffect, useRef } from "react";
import { FileState } from "@/constants/file.constants";
import { User } from "@/types/auth.types";
import { isAdmin } from "@/utils/user.util";
import useAuth from "@/hooks/useAuth";
import { usePlaylists } from "@/api/playlist/query/usePlaylists";
import { Control, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { UpdateVideoPlaylistFormValues } from "@/schemas/update-playlist.schema";
import { useWatch } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { usePlaylist } from "@/api/playlist/query/usePlaylist";
import { Playlist } from "@/types/playlist.types";

type Props = {
  control: Control<UpdateVideoPlaylistFormValues>;
  getValues: UseFormGetValues<UpdateVideoPlaylistFormValues>;
  setValue: UseFormSetValue<UpdateVideoPlaylistFormValues>;
};

export const usePlaylistState = ({ control, setValue }: Props) => {
  const { user } = useAuth();
  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const [searchParams] = useSearchParams();
  const hasSetInitialValue = useRef(false);
  const initialPlaylistUUID = searchParams.get("playlist") ?? undefined;
  const initialPlaylistQuery = usePlaylist(initialPlaylistUUID);
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

  const playlistsOptions = useMemo(() => {
    const options = (playlistsData?.data?.playlists ?? [])
      .filter((playlist) => playlist.name)
      .map((playlist) => ({
        label: playlist?.name ?? "-",
        value: playlist?.uuid,
      }));

    return options;
  }, [playlistsData]);

  // Set initial playlist value when it loads
  useEffect(() => {
    if (
      initialPlaylistQuery.isFetched &&
      initialPlaylistQuery.data?.data?.playlist &&
      !hasSetInitialValue.current
    ) {
      const initialPlaylist = initialPlaylistQuery.data.data.playlist;
      setValue("playlist", {
        label: initialPlaylist.name ?? "-",
        value: initialPlaylist.uuid ?? "",
      });
      setPlaylist(initialPlaylist);
      hasSetInitialValue.current = true;
    } else if (!initialPlaylistQuery.isLoading) {
      hasSetInitialValue.current = true;
    }
  }, [setValue, initialPlaylistQuery]);

  // Set playlist value
  // useEffect(() => {
  //   if (hasSetInitialValue.current) {
  //     const foundPlaylist = playlistsData?.data?.playlists?.find(
  //       (p) => p.uuid === selectedPlaylistUUID,
  //     );

  //     if (foundPlaylist) {
  //       setPlaylist(foundPlaylist);
  //     }
  //   }
  // }, [selectedPlaylistUUID, playlistsData]);

  console.log({ playlist });

  const handlePlaylistChange = (newValue: { label: string; value: string }) => {
    setValue("playlist", newValue);

    const foundPlaylist = playlistsData?.data?.playlists?.find(
      (p) => p.uuid === newValue.value,
    );

    if (foundPlaylist) {
      setPlaylist(foundPlaylist);
    }
  };

  return {
    playlistUUID: selectedPlaylistUUID,
    playlist,
    isPlaylistsLoading: isPlaylistsLoading || initialPlaylistQuery.isLoading,
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
    handlePlaylistChange,
  };
};
