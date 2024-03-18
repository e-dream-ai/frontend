import * as yup from "yup";

export type SignupFormValues = {
  username: string;
  password: string;
  confirmPassword: string;
  terms?: boolean;
};

export type SignupRequestValues = {
  username: string;
  email: string;
  password: string;
};

const getCharacterValidationError = (str: string) => {
  return `Your password must have at least 1 ${str} character`;
};

export const passwordSchemaProperty = yup
  .string()
  .min(8, "Password must be at least 8 characters.")
  .matches(/[A-Z]/, getCharacterValidationError("uppercase"))
  .required();

export const confirmPasswordSchemaProperty = yup
  .string()
  .min(8, "Confirm password must be at least 8 characters.")
  .matches(/[A-Z]/, getCharacterValidationError("uppercase"))
  .required()
  .oneOf([yup.ref("password"), ""], "Passwords must match");

export const SignupSchema = yup
  .object({
    username: yup.string().email().required("Email is required."),
    password: passwordSchemaProperty,
    confirmPassword: confirmPasswordSchemaProperty,
    terms: yup.boolean().oneOf([true], "You have to accept Terms of Service"),
  })
  .required();

export default SignupSchema;
