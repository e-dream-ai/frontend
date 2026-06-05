import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/api.types";

export type AuthAlertVariant = "error" | "warning" | "success" | "info";

export type AuthErrorKind =
  | "INVALID_CODE"
  | "CODE_EXPIRED"
  | "CODE_LOCKED_OUT"
  | "RATE_LIMITED"
  | "USER_NOT_FOUND"
  | "BAD_REQUEST"
  | "NETWORK"
  | "UNKNOWN";

export type AuthErrorInfo = {
  kind: AuthErrorKind;
  variant: AuthAlertVariant;
  titleKey: string;
  messageKey: string;
  canResend: boolean;
  canRetry: boolean;
  retryAfterSeconds?: number;
};

const BASE = "page.auth.error";

export const classifyAuthError = (
  errorCode?: string,
  retryAfterSeconds?: number,
): AuthErrorInfo => {
  switch (errorCode) {
    case "INVALID_CODE":
      return {
        kind: "INVALID_CODE",
        variant: "error",
        titleKey: `${BASE}.invalid_code_title`,
        messageKey: `${BASE}.invalid_code_message`,
        canResend: true,
        canRetry: false,
      };
    case "CODE_EXPIRED":
      return {
        kind: "CODE_EXPIRED",
        variant: "warning",
        titleKey: `${BASE}.expired_title`,
        messageKey: `${BASE}.expired_message`,
        canResend: true,
        canRetry: false,
      };
    case "CODE_LOCKED_OUT":
      return {
        kind: "CODE_LOCKED_OUT",
        variant: "error",
        titleKey: `${BASE}.locked_title`,
        messageKey: `${BASE}.locked_message`,
        canResend: true,
        canRetry: false,
      };
    case "RATE_LIMITED":
      return {
        kind: "RATE_LIMITED",
        variant: "warning",
        titleKey: `${BASE}.rate_limited_title`,
        messageKey: retryAfterSeconds
          ? `${BASE}.rate_limited_message`
          : `${BASE}.rate_limited_message_generic`,
        canResend: false,
        canRetry: false,
        retryAfterSeconds,
      };
    case "USER_NOT_FOUND":
      return {
        kind: "USER_NOT_FOUND",
        variant: "error",
        titleKey: `${BASE}.user_not_found_title`,
        messageKey: `${BASE}.user_not_found_message`,
        canResend: false,
        canRetry: false,
      };
    case "BAD_REQUEST":
      return {
        kind: "BAD_REQUEST",
        variant: "error",
        titleKey: `${BASE}.bad_request_title`,
        messageKey: `${BASE}.bad_request_message`,
        canResend: false,
        canRetry: true,
      };
    case "NETWORK":
      return {
        kind: "NETWORK",
        variant: "error",
        titleKey: `${BASE}.network_title`,
        messageKey: `${BASE}.network_message`,
        canResend: false,
        canRetry: true,
      };
    default:
      return {
        kind: "UNKNOWN",
        variant: "error",
        titleKey: `${BASE}.unknown_title`,
        messageKey: `${BASE}.unknown_message`,
        canResend: false,
        canRetry: true,
      };
  }
};

export const extractAuthError = (
  error: unknown,
): { errorCode?: string; retryAfterSeconds?: number } => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    if (!axiosError.response) {
      return { errorCode: "NETWORK" };
    }
    const { errorCode, retryAfterSeconds } = axiosError.response.data ?? {};
    return { errorCode, retryAfterSeconds };
  }
  return {};
};
