import * as yup from "yup";

export type CreatePlaylistFormValues = {
  name: string;
  nsfw?: boolean;
  ccbyLicense?: boolean;
  description?: string;
  sourceUrl?: string;
};

export const CreatePlaylistSchema = yup
  .object({
    name: yup.string().required(),
    nsfw: yup.boolean(),
    ccbyLicense: yup.boolean(),
    description: yup.string(),
    sourceUrl: yup.string(),
  })
  .required();

export default CreatePlaylistSchema;
