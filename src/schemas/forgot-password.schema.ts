import * as yup from "yup";

export type ForgotPasswordFormValues = {
  username: string;
};

export const ForgotPasswordSchema = yup
  .object({
    username: yup.string().email().required(),
  })
  .required();

export default ForgotPasswordSchema;
