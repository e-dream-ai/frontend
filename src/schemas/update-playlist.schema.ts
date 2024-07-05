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

export type UpdatePlaylistRequestValues = {
  name: string;
  featureRank?: number;
  displayedOwner?: number;
  nsfw?: boolean;
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

export default UpdatePlaylistSchema;
