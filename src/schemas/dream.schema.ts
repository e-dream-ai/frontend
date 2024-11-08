import * as yup from "yup";

export type DreamRequestValues = {
  uuid: string;
};

export type CreateDreamFormValues = {
  description?: string;
  sourceUrl?: string;
  nsfw: boolean;
  ccbyLicense: boolean;
};

export const CreateDreamSchema = yup
  .object({
    description: yup.string(),
    sourceUrl: yup.string(),
    nsfw: yup.boolean().required(),
    ccbyLicense: yup.boolean().required(),
  })
  .required();
