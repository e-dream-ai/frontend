import * as yup from "yup";

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
    email: yup.string().email().required(),
    code: yup.string().length(6).required(),
  })
  .required();

export default VerifyEmailSchema;
