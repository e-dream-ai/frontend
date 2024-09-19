import * as yup from "yup";

export type SignupFormValues = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  code?: string;
  terms?: boolean;
};

export type SignupRequestValues = {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  code?: string;
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

export const getSignupSchema = (isSignupCodeActive: boolean) =>
  yup.object({
    email: yup.string().email().required("Email is required."),
    firstName: yup.string().required().max(50),
    lastName: yup.string().required().max(50),
    password: passwordSchemaProperty,
    confirmPassword: confirmPasswordSchemaProperty,
    code: isSignupCodeActive
      ? yup.string().required("Code is required.")
      : yup.string().optional(),
    terms: yup.boolean().oneOf([true], "You have to accept Terms of Service"),
  });

export default getSignupSchema;
