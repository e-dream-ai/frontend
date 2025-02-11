import * as yup from "yup";

export type CreateKeyframeFormRequest = {
  name: string;
};

export type CreateKeyframeFormValues = {
  name: string;
  playlist: {
    label: string;
    value: string;
  };
};

export const CreateKeyframeSchema = yup
  .object({
    name: yup.string().required(),
    playlist: yup
      .object({
        label: yup.string().required("Playlist is required."),
        value: yup.string().uuid().required(),
      })
      .required("Playlist is required."),
  })
  .required();

export default CreateKeyframeSchema;
