import * as yup from "yup";

export type SignupFormValues = {
  email: string;
  firstName: string;
  lastName: string;
  // password: string;
  // confirmPassword: string;
  code?: string;
  terms?: boolean;
};

export type SignupRequestValues = {
  email: string;
  firstname: string;
  lastname: string;
  // password: string;
  code?: string;
};

const getCharacterValidationError = (str: string) => {
  return `Your password must have at least 1 ${str} character`;
};

/**
 * Match password rules with workos
 */
export const passwordSchemaProperty = yup
  .string()
  .min(10, "Password must be at least 10 characters.")
  .matches(/[0-9]/, getCharacterValidationError("number"))
  .matches(/[a-z]/, getCharacterValidationError("lowercase"))
  .matches(/[A-Z]/, getCharacterValidationError("uppercase"))
  .required();

export const confirmPasswordSchemaProperty = yup
  .string()
  .min(10, "Confirm password must be at least 10 characters.")
  .matches(/[0-9]/, getCharacterValidationError("number"))
  .matches(/[a-z]/, getCharacterValidationError("lowercase"))
  .matches(/[A-Z]/, getCharacterValidationError("uppercase"))
  .required()
  .oneOf([yup.ref("password"), ""], "Passwords must match");

export const getSignupSchema = (isSignupCodeActive: boolean) =>
  yup.object({
    email: yup.string().email().required("Email is required."),
    firstName: yup.string().required().max(50),
    lastName: yup.string().required().max(50),
    // password: passwordSchemaProperty,
    // confirmPassword: confirmPasswordSchemaProperty,
    code: isSignupCodeActive
      ? yup.string().required("Code is required.")
      : yup.string().optional(),
    terms: yup.boolean().oneOf([true], "You have to accept Terms of Service"),
  });

export default getSignupSchema;
