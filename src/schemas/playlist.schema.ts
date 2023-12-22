import { ApiResponse } from "@/types/api.types";
import { Playlist } from "@/types/playlist.types";

export type PlaylistApiResponse =
  | ApiResponse<{ playlist: Playlist }>
  | undefined;
