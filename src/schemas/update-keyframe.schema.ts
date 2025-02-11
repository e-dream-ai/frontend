import * as yup from "yup";
import { CompletedPart } from "./multipart-upload";

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

export type InitKeyframeImageMultipartUploadFormValues = {
  uuid?: string;
  values: {
    extension: string;
  };
};

export type InitKeyframeImageMultipartUploadResponse = {
  keyframe?: Keyframe;
  uploadId?: string;
  urls?: Array<string>;
};

export type CompleteKeyframeImageMultipartUploadFormValues = {
  uuid?: string;
  values: {
    extension?: string;
    parts?: Array<CompletedPart>;
    uploadId?: string;
  };
};

export default UpdateKeyframeSchema;
