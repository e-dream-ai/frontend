import { User } from "types/auth.types";
import { Dream } from "types/dream.types";
import { Playlist } from "types/playlist.types";

export type FeedItem = {
  id: number;
  user: Omit<User, "token">;
  type: "dream" | "playlist";
  dreamItem?: Dream;
  playlistItem?: Omit<Playlist, "items">;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};
