import * as yup from "yup";

export type ProviderKeyFormRequest = {
  key: string;
};

export const ProviderKeySchema = yup
  .object({
    key: yup
      .string()
      .trim()
      .matches(/^[\x21-\x7e]+$/, "components.provider_key_card.invalid_format")
      .required("components.provider_key_card.key_required"),
  })
  .required();
