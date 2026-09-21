import { usePlaylist } from "@/api/playlist/query/usePlaylist";
import type { Playlist } from "@/types/playlist.types";
import { secondsToTimeFormat } from "@/utils/video.utils";

const UNAVAILABLE = "dream count unavailable";

export function describePlaylistContents(playlist?: Playlist | null): string {
  if (!playlist) return UNAVAILABLE;

  const count = playlist.totalDreamCount;
  const dreams =
    count === undefined
      ? UNAVAILABLE
      : `${count} dream${count === 1 ? "" : "s"}`;

  return typeof playlist.totalDurationSeconds === "number"
    ? `${dreams} \u00b7 ${secondsToTimeFormat(playlist.totalDurationSeconds)}`
    : dreams;
}

export function usePlaylistMetadata(uuid: string): string {
  const { data, isFetching } = usePlaylist(uuid, Boolean(uuid));
  const playlist = data?.data?.playlist;

  if (!playlist || playlist.uuid !== uuid) {
    return isFetching ? "counting dreams\u2026" : UNAVAILABLE;
  }

  return describePlaylistContents(playlist);
}
