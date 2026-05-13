import * as yup from "yup";
import { emailSchema } from "./email.schema";

export type CreatePasswordResetFormValues = {
  email: string;
};

export const CreatePasswordResetSchema = yup
  .object({
    email: emailSchema,
  })
  .required();
