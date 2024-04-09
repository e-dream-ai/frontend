import * as yup from "yup";

export type UpdatePlaylistFormValues = {
  name: string;
  featureRank?: number;
  owner?: string;
  created_at?: string;
};

export const UpdatePlaylistSchema = yup
  .object({
    name: yup.string().required(),
    featureRank: yup.number(),
    owner: yup.string(),
    created_at: yup.string(),
  })
  .required();

export default UpdatePlaylistSchema;
