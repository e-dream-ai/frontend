import { User } from "./auth.types";

export type Playlist = {
  id: number;
  name: string;
  thumbnail: string;
  updated_at: string;
  user: User;
  created_at: string;
};

export type PlaylistMediaState =
  | {
      fileBlob: Blob;
      url: string;
    }
  | undefined;
