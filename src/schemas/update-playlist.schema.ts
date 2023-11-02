import * as yup from "yup";

export type UpdatePlaylistFormValues = {
  name: string;
  owner?: string;
  created_at?: string;
};

export const UpdatePlaylistSchema = yup
  .object({
    name: yup.string().required(),
    owner: yup.string(),
    created_at: yup.string(),
  })
  .required();

export default UpdatePlaylistSchema;
