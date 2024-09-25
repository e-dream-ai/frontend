import * as yup from "yup";

export type MagicFormValues = {
  email: string;
  code: string;
};

export const MagicSchema = yup
  .object({
    email: yup.string().email().required("Email is required."),
    code: yup.string().length(6).required("Code is required."),
  })
  .required();

export default MagicSchema;
