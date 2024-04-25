import * as yup from "yup";

export type CreatePlaylistFormValues = {
  name: string;
  nsfw?: boolean;
};

export const CreatePlaylistSchema = yup
  .object({
    name: yup.string().required(),
    nsfw: yup.boolean(),
  })
  .required();

export default CreatePlaylistSchema;
