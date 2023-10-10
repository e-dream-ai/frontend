export type MutationResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};
