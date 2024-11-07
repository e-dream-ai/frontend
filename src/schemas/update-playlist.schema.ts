import * as yup from "yup";

export type UpdatePlaylistFormValues = {
  name: string;
  featureRank?: number;
  user?: string;
  displayedOwner: {
    label?: string;
    value?: number;
  };
  nsfw: {
    label?: string;
    value?: string;
  };
  created_at?: string;
};

export type UpdateVideoPlaylistFormValues = {
  playlist: {
    label: string;
    value: string;
  };
  nsfw: boolean;
  ccaLicense: boolean;
};

export type UpdatePlaylistRequestValues = {
  uuid: string;
  values: {
    name: string;
    featureRank?: number;
    displayedOwner?: number;
    nsfw?: boolean;
  };
};

export const UpdatePlaylistSchema = yup
  .object({
    name: yup.string().required(),
    featureRank: yup
      .number()
      .typeError("Activity level must be a integer")
      .integer(),
    user: yup.string(),
    displayedOwner: yup.object({
      label: yup.string(),
      value: yup.number(),
    }),
    nsfw: yup.object({
      label: yup.string(),
      value: yup.string(),
    }),
    created_at: yup.string(),
  })
  .required();

export const UpdateVideoPlaylistSchema = yup
  .object({
    playlist: yup
      .object({
        label: yup.string().required("Playlist is required."),
        value: yup.string().uuid().required(),
      })
      .required("Playlist is required."),
    nsfw: yup.boolean().required(),
    ccaLicense: yup.boolean().required(),
  })
  .required();

export default UpdatePlaylistSchema;
