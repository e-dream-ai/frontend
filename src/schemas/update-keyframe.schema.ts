import * as yup from "yup";

export type UpdateKeyframeFormValues = {
  name: string;
  user?: string;
  displayedOwner: {
    label?: string;
    value?: number;
  };
  created_at?: string;
};

export type UpdateKeyframeRequestValues = {
  uuid: string;
  values: {
    name: string;
    displayedOwner?: number;
  };
};

export const UpdateKeyframeSchema = yup
  .object({
    name: yup.string().required(),
    user: yup.string(),
    displayedOwner: yup.object({
      label: yup.string(),
      value: yup.number(),
    }),
    created_at: yup.string(),
  })
  .required();

export default UpdateKeyframeSchema;
