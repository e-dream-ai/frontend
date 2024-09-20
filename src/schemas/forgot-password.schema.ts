import * as yup from "yup";

export type CreatePasswordResetFormValues = {
  email: string;
};

export const CreatePasswordResetSchema = yup
  .object({
    email: yup.string().email().required(),
  })
  .required();
