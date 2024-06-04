import * as yup from "yup";

export type InviteByEmailFormValues = {
  email: string;
  codeLength: number;
  role: {
    label: string;
    value: number;
  };
};

export const InviteByEmailSchema = yup
  .object()
  .shape({
    email: yup.string().email().required("Email is required."),
    codeLength: yup
      .number()
      .typeError("Code length must be a number.")
      .required("Code length is required.")
      .positive("Code length must be a positive number.")
      .integer("Code length must be an integer.")
      .moreThan(3, "Code length must be 4 at least."),
    role: yup
      .object({
        label: yup.string().required("Role is required."),
        value: yup.number().required(),
      })
      .required("Role is required."),
  })
  .required();

export type InviteCustomCodeFormValues = {
  code: string;
  size: number;
  role: {
    label: string;
    value: number;
  };
};

export const InviteCustomCodeSchema = yup
  .object()
  .shape({
    code: yup
      .string()
      .required("Code is required.")
      .matches(
        /^[ABCDEFGHJKLMNPQRSTUVWXYZ0123456789]*$/,
        "Code should contain A-Z and 0-9 (excluding I and O)",
      ),
    size: yup
      .number()
      .typeError("Redeem size must be a number.")
      .required("Redeem size is required.")
      .positive("Redeem size must be a positive number.")
      .integer("Redeem size must be an integer.")
      .moreThan(0, "Redeem size must be 1 at least."),
    role: yup
      .object({
        label: yup.string().required("Role is required."),
        value: yup.number().required(),
      })
      .required("Role is required."),
  })
  .required();

export type InviteRequestValues = {
  emails?: string[];
  code?: string;
  size?: number;
  codeLength?: number;
  roleId?: number;
};
