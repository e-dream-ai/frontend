import * as yup from "yup";

export type UpdateDreamFormValues = {
  name: string;
};

export const UpdateDreamSchema = yup
  .object({
    name: yup.string().required(),
  })
  .required();

export default UpdateDreamSchema;
