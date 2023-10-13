import * as yup from "yup";

export type UpdateDreamFormValues = {
  name: string;
  owner?: string;
  created_at?: string;
};

export const UpdateDreamSchema = yup
  .object({
    name: yup.string().required(),
    owner: yup.string(),
    created_at: yup.string(),
  })
  .required();

export default UpdateDreamSchema;
