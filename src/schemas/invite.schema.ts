import * as yup from "yup";

export type InviteByEmailFormValues = {
  email: string;
  codeLength?: number;
};

export const InviteByEmailSchema = yup
  .object({
    email: yup.string().required(),
    codeLength: yup.number(),
  })
  .required();

export type InviteCustomCodeFormValues = {
  code: string;
  size?: number;
};

export const InviteCustomCodeSchema = yup
  .object({
    code: yup.string().required(),
    size: yup.number(),
  })
  .required();

export type InviteRequestValues = {
  emails?: string[];
  code?: string;
  size?: number;
  codeLength?: number;
};
