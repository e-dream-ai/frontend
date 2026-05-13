import isEmail from "validator/lib/isEmail";
import * as yup from "yup";

export const emailSchema = yup
  .string()
  .test(
    "is-valid-email",
    "Please enter a valid email address.",
    (value) => !value || isEmail(value),
  )
  .required("Email is required.");
