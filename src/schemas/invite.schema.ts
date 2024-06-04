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
    codeLength: yup.number().required("Code length is required."),
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
    code: yup.string().required("Code is required."),
    size: yup.number().required("Redeem size is required."),
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
