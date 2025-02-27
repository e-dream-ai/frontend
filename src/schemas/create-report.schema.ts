import { UNLICENSED_TYPE_ID } from "@/constants/report.constants";
import * as yup from "yup";

export type CreateReportFormRequest = {
  dreamUUID: string;
  typeId: number;
  comments?: string;
  link?: string;
};

export type CreateReportFormValues = {
  type: {
    label: string;
    value: number;
  };
  comments?: string;
  link?: string;
};

export const CreateReportSchema = yup
  .object({
    type: yup
      .object({
        label: yup.string().required("Type is required."),
        value: yup.number().positive().required(),
      })
      .required("Playlist is required."),
    comments: yup.string(),
    link: yup.string().when("type.value", {
      is: UNLICENSED_TYPE_ID,
      then: (schema) => schema.url().required("Link is required for this type"),
      otherwise: (schema) => schema.url(),
    }),
  })
  .required();
