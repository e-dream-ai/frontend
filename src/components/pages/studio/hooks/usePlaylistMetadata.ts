import { usePlaylist } from "@/api/playlist/query/usePlaylist";
import { secondsToTimeFormat } from "@/utils/video.utils";

export function usePlaylistMetadata(uuid: string): string {
  const { data, isFetching } = usePlaylist(uuid, Boolean(uuid));
  const playlist = data?.data?.playlist;

  if (!playlist || playlist.uuid !== uuid) {
    return isFetching ? "counting dreams…" : "dream count unavailable";
  }

  const count = playlist.totalDreamCount;
  const dreams =
    count === undefined
      ? "dream count unavailable"
      : `${count} dream${count === 1 ? "" : "s"}`;

  return typeof playlist.totalDurationSeconds === "number"
    ? `${dreams} · ${secondsToTimeFormat(playlist.totalDurationSeconds)}`
    : dreams;
}
