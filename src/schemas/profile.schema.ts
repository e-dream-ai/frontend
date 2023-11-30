import * as yup from "yup";

export type ProfileFormValues = {
  name: string;
  description?: string;
};

export const ProfileSchema = yup
  .object({
    name: yup.string().required(),
    description: yup.string(),
  })
  .required();

export default ProfileSchema;
