import { User } from "@/types/auth.types";
import { Dream } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";

export enum FeedItemType {
  ALL = "all",
  PLAYLIST = "playlist",
  DREAM = "dream",
  USER = "user",
  CREATOR = "creator",
  ADMIN = "admin",
}

export type FeedItemServerType = Omit<
  FeedItemType,
  "all" | "user" | "creator" | "admin"
>;

export type FeedItem = {
  id: number;
  user: Omit<User, "token">;
  type: Omit<FeedItemType, "all" | "user">;
  dreamItem?: Dream;
  playlistItem?: Omit<Playlist, "items">;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};

export type UserFeedType = "all" | "playlist" | "dream" | "upvote" | "downvote";
