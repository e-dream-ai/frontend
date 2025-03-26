import { User } from "@/types/auth.types";
import { Dream } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";

export enum FeedItemFilter {
  ALL = "all",
  PLAYLIST = "playlist",
  DREAM = "dream",
  USER = "user",
  CREATOR = "creator",
  ADMIN = "admin",
}

export type FeedItemType =
  | "all"
  | "dream"
  | "playlist"
  | "user"
  | "creator"
  | "admin";

export type RequestFeedItemType = "playlist" | "dream";

export type FeedItemFilterType = RequestFeedItemType | "all" | "hidden";

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

export type UserFeedType =
  | "all"
  | "playlist"
  | "dream"
  | "upvote"
  | "downvote"
  | "hidden";

export type PlaylistWithDreams = {
  id: number;
  uuid: string;
  name: string;
  user?: User;
  displayedOwner?: User;
  dreams: Dream[];
};
