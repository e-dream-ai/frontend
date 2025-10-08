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
  nsfw?: boolean;
  hidden?: boolean;
  totalDurationSeconds?: number;
  totalDurationFormatted?: string;
  totalDreamCount?: number;
};

export type PlaylistMediaState =
  | {
      fileBlob: Blob;
      url: string;
    }
  | undefined;
