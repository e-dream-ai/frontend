import * as yup from "yup";
import { emailSchema } from "./email.schema";

export type MagicFormValues = {
  email: string;
  code: string;
};

export const MagicSchema = yup
  .object({
    email: emailSchema,
    code: yup.string().length(6).required("Code is required."),
  })
  .required();

export default MagicSchema;
