import { usePlaylist } from "@/api/playlist/query/usePlaylist";
import type { Playlist } from "@/types/playlist.types";
import { secondsToTimeFormat } from "@/utils/video.utils";
import {
  describePlaylistFps,
  describePlaylistResolution,
} from "../utils/enhance-media";

const UNAVAILABLE = "dream count unavailable";

const joinParts = (parts: Array<string | null>) =>
  parts.filter(Boolean).join(" \u2022 ");

/**
 * Summary lines: `12 dreams • 1280×720`, then `00:03:40 • 24 fps • 5,280 frames`.
 * The second line is left out when there is nothing to show on it.
 */
export function describePlaylistContents(playlist?: Playlist | null): string[] {
  if (!playlist) return [UNAVAILABLE];

  const count = playlist.totalDreamCount;
  const dreams =
    count === undefined
      ? UNAVAILABLE
      : `${count} dream${count === 1 ? "" : "s"}`;

  const { media, totalDurationSeconds, totalFrames } = playlist;
  const timing = joinParts([
    typeof totalDurationSeconds === "number"
      ? secondsToTimeFormat(totalDurationSeconds)
      : null,
    media ? describePlaylistFps(media) : null,
    totalFrames
      ? `${totalFrames.toLocaleString("en-US")} frame${
          totalFrames === 1 ? "" : "s"
        }`
      : null,
  ]);

  return [
    joinParts([dreams, media ? describePlaylistResolution(media) : null]),
    ...(timing ? [timing] : []),
  ];
}

export function usePlaylistMetadata(uuid: string): {
  playlist: Playlist | undefined;
  meta: string[];
} {
  const { data, isFetching } = usePlaylist(uuid, Boolean(uuid));
  const fetched = data?.data?.playlist;
  const playlist = fetched?.uuid === uuid ? fetched : undefined;

  return {
    playlist,
    meta: playlist
      ? describePlaylistContents(playlist)
      : [isFetching ? "counting dreams\u2026" : UNAVAILABLE],
  };
}
