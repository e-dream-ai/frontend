import * as yup from "yup";

export type UpdateDreamFormValues = {
  name: string;
  activityLevel?: number;
  featureRank?: number;
  processedVideoSize?: string;
  processedVideoFrames?: string;
  processedVideoFPS?: string;
  user?: string;
  description?: string;
  prompt?: Record<string, unknown> | null;
  sourceUrl?: string;
  displayedOwner: {
    label?: string;
    value?: number;
  };
  nsfw: {
    label?: string;
    value?: string;
  };
  hidden: {
    label?: string;
    value?: string;
  };
  ccbyLicense: {
    label?: string;
    value?: string;
  };
  startKeyframe: {
    label?: string;
    value?: string;
  };
  endKeyframe: {
    label?: string;
    value?: string;
  };
  upvotes?: number;
  downvotes?: number;
  created_at?: string;
  processed_at?: string;
};

export type UpdateDreamRequestValues = {
  name: string;
  description?: string;
  prompt?: string;
  sourceUrl?: string;
  activityLevel?: number;
  featureRank?: number;
  displayedOwner?: number;
  startKeyframe?: string;
  endKeyframe?: string;
  nsfw?: boolean;
  hidden?: boolean;
  ccbyLicense?: boolean;
};

export const UpdateDreamSchema = yup
  .object({
    name: yup.string().required(),
    description: yup.string(),
    prompt: yup.mixed(),
    sourceUrl: yup
      .string()
      .url("Invalid URL format. URL must start with http:// or https://"),
    activityLevel: yup.number().typeError("Activity level must be a number"),
    featureRank: yup
      .number()
      .typeError("Activity level must be a integer")
      .integer(),
    processedVideoSize: yup.string(),
    processedVideoFrames: yup.string(),
    user: yup.string(),
    displayedOwner: yup.object({
      label: yup.string(),
      value: yup.number(),
    }),
    nsfw: yup.object({
      label: yup.string(),
      value: yup.string(),
    }),
    hidden: yup.object({
      label: yup.string(),
      value: yup.string(),
    }),
    ccbyLicense: yup.object({
      label: yup.string(),
      value: yup.string(),
    }),
    startKeyframe: yup.object({
      label: yup.string(),
      value: yup.string().uuid(),
    }),
    endKeyframe: yup.object({
      label: yup.string(),
      value: yup.string().uuid(),
    }),
    created_at: yup.string(),
  })
  .required();

export default UpdateDreamSchema;
