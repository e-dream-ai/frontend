import * as yup from "yup";
import { emailSchema } from "./email.schema";

export type VerifyEmailRequestValues = {
  username: string;
  code: string;
};

export type VerifyEmailFormValues = {
  email: string;
  code: string;
};

export const VerifyEmailSchema = yup
  .object({
    email: emailSchema,
    code: yup.string().length(6).required(),
  })
  .required();

export default VerifyEmailSchema;
