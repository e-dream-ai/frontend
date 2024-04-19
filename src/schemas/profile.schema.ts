import * as yup from "yup";

export type ProfileFormRequest = {
  name: string;
  description?: string;
  role?: number;
  nsfw?: boolean;
};

export type ProfileFormValues = {
  name: string;
  description?: string;
  role: {
    label?: string;
    value?: number;
  };
  nsfw: {
    label?: string;
    value?: string;
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
    nsfw: yup.object({
      label: yup.string(),
      value: yup.string(),
    }),
  })
  .required();

export default ProfileSchema;
