import * as yup from "yup";

export type UpdateDreamFormValues = {
  name: string;
  activityLevel?: number;
  featureRank?: number;
  processedVideoSize?: string;
  processedVideoFrames?: string;
  processedVideoFPS?: string;
  user?: string;
  displayedOwner: {
    label?: string;
    value?: number;
  };
  created_at?: string;
};

export type UpdateDreamRequestValues = {
  name: string;
  activityLevel?: number;
  featureRank?: number;
  displayedOwner?: number;
};

export const UpdateDreamSchema = yup
  .object({
    name: yup.string().required(),
    activityLevel: yup.number(),
    featureRank: yup.number(),
    processedVideoSize: yup.string(),
    processedVideoFrames: yup.string(),
    user: yup.string(),
    displayedOwner: yup.object({
      label: yup.string(),
      value: yup.number(),
    }),
    created_at: yup.string(),
  })
  .required();

export default UpdateDreamSchema;
