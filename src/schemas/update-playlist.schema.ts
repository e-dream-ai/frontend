import * as yup from "yup";

export type UpdatePlaylistFormValues = {
  name: string;
  featureRank?: number;
  user: {
    label?: string;
    value: number;
  };
  created_at?: string;
};

export type UpdatePlaylistRequestValues = {
  name: string;
  featureRank?: number;
  user?: number;
};

export const UpdatePlaylistSchema = yup
  .object({
    name: yup.string().required(),
    featureRank: yup.number(),
    user: yup.object({
      label: yup.string(),
      value: yup.number().required(),
    }),
    created_at: yup.string(),
  })
  .required();

export default UpdatePlaylistSchema;
