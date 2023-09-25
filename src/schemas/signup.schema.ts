import * as yup from "yup";

export type SignupFormValues = {
  username: string;
  password: string;
  confirmPassword: string;
};

export type SignupRequestValues = {
  username: string;
  email: string;
  password: string;
};

const getCharacterValidationError = (str: string) => {
  return `Your password must have at least 1 ${str} character`;
};

export const SignupSchema = yup
  .object({
    username: yup.string().email().required(),
    password: yup
      .string()
      .min(8)
      .matches(/[A-Z]/, getCharacterValidationError("uppercase"))
      .required(),
    confirmPassword: yup
      .string()
      .min(8)
      .matches(/[A-Z]/, getCharacterValidationError("uppercase"))
      .required()
      .oneOf([yup.ref("password"), ""], "Passwords must match"),
  })
  .required();

export default SignupSchema;
