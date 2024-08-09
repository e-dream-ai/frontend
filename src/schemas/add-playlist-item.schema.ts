export type AddPlaylistItemFormValues = {
  values: {
    type: "dream" | "playlist";
    uuid: string;
  };
  playlistUUID: string;
};
