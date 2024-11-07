import * as yup from "yup";

export type DreamRequestValues = {
  uuid: string;
};

export type CreateDreamFormValues = {
  nsfw: boolean;
  ccaLicense: boolean;
};

export const CreateDreamSchema = yup
  .object({
    nsfw: yup.boolean().required(),
    ccaLicense: yup.boolean().required(),
  })
  .required();
