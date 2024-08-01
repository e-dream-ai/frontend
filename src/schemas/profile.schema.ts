import * as yup from "yup";

export type ProfileFormRequest = {
  name: string;
  description?: string;
  role?: number;
  nsfw?: boolean;
  enableMarketingEmails?: boolean;
  quota?: number;
};

export type ProfileFormValues = {
  name: string;
  description?: string;
  role: {
    label?: string;
    value?: number;
  };
  nsfw: {
    label?: string;
    value?: string;
  };
  enableMarketingEmails: {
    label?: string;
    value?: string;
  };
  quota?: number;
};

export const ProfileSchema = yup
  .object({
    name: yup.string().required(),
    description: yup.string(),
    role: yup.object({
      label: yup.string(),
      value: yup.number(),
    }),
    nsfw: yup.object({
      label: yup.string(),
      value: yup.string(),
    }),
    enableMarketingEmails: yup.object({
      label: yup.string(),
      value: yup.string(),
    }),
    quota: yup
      .number()
      .typeError("quota must be a number.")
      .positive()
      .test(
        "decimal-places",
        "quota must have 1 or 2 decimal places.",
        (value) => {
          if (value === undefined || value === null) return false;
          const stringValue = value.toFixed(2);
          return /^\d+(\.\d{1,2})?$/.test(stringValue);
        },
      ),
  })
  .required();

export default ProfileSchema;
