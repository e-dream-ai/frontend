import * as yup from "yup";

export type ProfileFormRequest = {
  name: string;
  description?: string;
  role?: number;
  nsfw?: boolean;
  enableMarketingEmails?: boolean;
  enableCreatingProprietaryDreams?: boolean;
  quota?: number;
  providerCreditsUsd?: number;
  dailyQuotaUsd?: number | null;
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
  enableCreatingProprietaryDreams: {
    label?: string;
    value?: string;
  };
  quota?: number;
  providerCreditsUsd?: number;
  dailyQuotaUsd?: number;
  dailyQuotaUnlimited: {
    label?: string;
    value?: string;
  };
};

const usdAmountField = (label: string) =>
  yup
    .number()
    .transform((value, original) =>
      original === "" || original == null ? undefined : value,
    )
    .typeError(`${label} must be a number.`)
    .min(0)
    .max(999999.9999)
    .optional();

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
    enableCreatingProprietaryDreams: yup.object({
      label: yup.string(),
      value: yup.string(),
    }),
    quota: yup
      .number()
      .typeError("quota must be a number.")
      .min(0)
      .test(
        "decimal-places",
        "quota must have 1 or 2 decimal places.",
        (value) => {
          if (value === undefined || value === null) return false;
          const stringValue = value.toFixed(2);
          return /^\d+(\.\d{1,2})?$/.test(stringValue);
        },
      ),
    providerCreditsUsd: usdAmountField("current credits"),
    dailyQuotaUsd: usdAmountField("daily credit limit"),
    dailyQuotaUnlimited: yup.object({
      label: yup.string(),
      value: yup.string(),
    }),
  })
  .required();

export default ProfileSchema;
