import * as yup from "yup";

export type CreatePlaylistFormValues = {
  name: string;
  nsfw?: boolean;
  ccaLicense?: boolean;
};

export const CreatePlaylistSchema = yup
  .object({
    name: yup.string().required(),
    nsfw: yup.boolean(),
    ccaLicense: yup.boolean(),
  })
  .required();

export default CreatePlaylistSchema;
