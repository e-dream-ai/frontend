import * as yup from "yup";
import { emailSchema } from "./email.schema";

export type LoginFormValues = {
  email: string;
  password: string;
};

export const LoginSchema = yup
  .object({
    email: emailSchema,
    password: yup.string().required("Password is required."),
  })
  .required();

export type MagicLoginFormValues = {
  email: string;
};

export const MagicLoginSchema = yup
  .object({
    email: emailSchema,
  })
  .required();

export default LoginSchema;
