import * as yup from "yup";

export type LoginFormValues = {
  username: string;
  password: string;
};

export const LoginSchema = yup
  .object({
    username: yup.string().email().required(),
    password: yup.string().required(),
  })
  .required();

export default LoginSchema;
