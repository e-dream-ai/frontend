import { User } from "./auth.types";
import { Dream } from "./dream.types";

export type PlaylistItem = {
  id: number;
  type: "dream" | "playlist";
  order: number;
  dreamItem?: Dream;
  playlistItem?: Omit<Playlist, "items">;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};

export type Playlist = {
  id: number;
  name: string;
  thumbnail: string;
  updated_at: string;
  user: User;
  created_at: string;
  items?: PlaylistItem[];
  itemCount?: number;
  featureRank?: number;
};

export type PlaylistMediaState =
  | {
      fileBlob: Blob;
      url: string;
    }
  | undefined;
