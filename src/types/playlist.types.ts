import { User } from "./auth.types";
import { Dream } from "./dream.types";
import { Keyframe } from "./keyframe.types";

export type PlaylistItem = {
  id: number;
  type: "dream" | "playlist";
  order: number;
  /**
   * playlist where belongs
   */
  playlist?: Omit<Playlist, "items">;
  dreamItem?: Dream;
  /**
   * playlist item
   */
  playlistItem?: Omit<Playlist, "items">;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};

export type PlaylistKeyframe = {
  id: number;
  order: number;
  /**
   * playlist where belongs
   */
  keyframe?: Keyframe;
  playlist?: Omit<Playlist, "items">;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};

export type Playlist = {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  thumbnail: string;
  updated_at: string;
  user: User;
  displayedOwner: User;
  created_at: string;
  items?: PlaylistItem[];
  playlistKeyframes?: PlaylistKeyframe[];
  playlistItems?: PlaylistItem[];
  itemCount?: number;
  featureRank?: number;
  loops?: number;
  nsfw?: boolean;
  hidden?: boolean;
  totalDurationSeconds?: number;
  totalDurationFormatted?: string;
  totalDreamCount?: number;
  prompt?: string | null;
};

export type UprezPlaylistPrompt = {
  infinidream_algorithm: "uprez_playlist";
  source_playlist_uuid: string;
  dream_algorithm?: string;
  params?: Record<string, unknown>;
};

export const parseUprezPlaylistPrompt = (
  prompt?: string | null,
): UprezPlaylistPrompt | null => {
  if (!prompt) return null;
  try {
    const parsed = typeof prompt === "string" ? JSON.parse(prompt) : prompt;
    if (
      parsed?.infinidream_algorithm === "uprez_playlist" &&
      typeof parsed?.source_playlist_uuid === "string"
    ) {
      return parsed as UprezPlaylistPrompt;
    }
    return null;
  } catch {
    return null;
  }
};

export type PlaylistMediaState =
  | {
      fileBlob: Blob;
      url: string;
    }
  | undefined;
