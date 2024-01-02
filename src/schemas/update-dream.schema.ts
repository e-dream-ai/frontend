import * as yup from "yup";

export type UpdateDreamFormValues = {
  name: string;
  activityLevel?: number;
  owner?: string;
  created_at?: string;
};

export const UpdateDreamSchema = yup
  .object({
    name: yup.string().required(),
    activityLevel: yup.number(),
    owner: yup.string(),
    created_at: yup.string(),
  })
  .required();

export default UpdateDreamSchema;
