export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  errorCode?: string;
  retryAfterSeconds?: number;
  data?: T;
};
