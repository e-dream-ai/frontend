import * as yup from "yup";

export type CreatePlaylistFormValues = {
  name: string;
};

export const CreatePlaylistSchema = yup
  .object({
    name: yup.string().required(),
  })
  .required();

export default CreatePlaylistSchema;
