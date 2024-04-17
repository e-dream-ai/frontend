import * as yup from "yup";

export type ProfileFormRequest = {
  name: string;
  description?: string;
  role?: number;
};

export type ProfileFormValues = {
  name: string;
  description?: string;
  role: {
    label?: string;
    value?: number;
  };
};

export const ProfileSchema = yup
  .object({
    name: yup.string().required(),
    description: yup.string(),
    role: yup.object({
      label: yup.string(),
      value: yup.number(),
    }),
  })
  .required();

export default ProfileSchema;
