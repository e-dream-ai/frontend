import * as yup from "yup";

export type DreamRequestValues = {
  uuid: string;
};

export type CreateDreamFormValues = {
  description?: string;
  sourceUrl?: string;
  nsfw: boolean;
  hidden?: boolean;
  ccbyLicense: boolean;
};

export const CreateDreamSchema = yup
  .object({
    description: yup
      .string()
      .max(4000, "Description must be at most 4000 characters"),
    sourceUrl: yup.string(),
    nsfw: yup.boolean().default(false).required(),
    hidden: yup.boolean(),
    ccbyLicense: yup.boolean().required(),
  })
  .required();
