import * as yup from "yup";

export type CreatePlaylistFormValues = {
  name: string;
  nsfw?: boolean;
  hidden?: boolean;
  ccbyLicense?: boolean;
  description?: string;
  sourceUrl?: string;
  prompt?: Record<string, unknown> | string;
};

export const CreatePlaylistSchema = yup
  .object({
    name: yup.string().required(),
    nsfw: yup.boolean(),
    hidden: yup.boolean(),
    ccbyLicense: yup.boolean(),
    description: yup.string(),
    sourceUrl: yup.string(),
  })
  .required();

export default CreatePlaylistSchema;
