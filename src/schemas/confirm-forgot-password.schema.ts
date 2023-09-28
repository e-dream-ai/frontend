import * as yup from "yup";
import {
  confirmPasswordSchemaProperty,
  passwordSchemaProperty,
} from "./signup.schema";

export type ConfirmForgotPasswordRequestValues = {
  username: string;
  code: string;
  password: string;
};

export type ConfirmForgotPasswordFormValues = {
  code: string;
  password: string;
  confirmPassword: string;
};

export const ConfirmForgotPasswordSchema = yup
  .object({
    code: yup.string().required(),
    password: passwordSchemaProperty,
    confirmPassword: confirmPasswordSchemaProperty,
  })
  .required();

export default ConfirmForgotPasswordSchema;
