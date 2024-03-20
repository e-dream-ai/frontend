import * as yup from "yup";

export type UpdateDreamFormValues = {
  name: string;
  activityLevel?: number;
  processedVideoSize?: string;
  processedVideoFrames?: string;
  owner?: string;
  created_at?: string;
};

export const UpdateDreamSchema = yup
  .object({
    name: yup.string().required(),
    activityLevel: yup.number(),
    processedVideoSize: yup.string(),
    processedVideoFrames: yup.string(),
    owner: yup.string(),
    created_at: yup.string(),
  })
  .required();

export default UpdateDreamSchema;
