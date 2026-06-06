import { yupResolver } from "@hookform/resolvers/yup";
import router from "@/routes/router";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import {
  AuthAlert,
  AuthAlertActionLink,
  AuthCard,
  Button,
  OtpInput,
  Row,
} from "@/components/shared";
import { OtpInputHandle } from "@/components/shared/otp-input/otp-input";
import { useAuth } from "@/hooks/useAuth";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { RotateCw } from "lucide-react";
import { ROUTES } from "@/constants/routes.constants";
import { AuthActionsRow, ResendButton, ResendIcon } from "./magic.styled";
import useMagic from "@/api/auth/useMagic";
import MagicSchema, { MagicFormValues } from "@/schemas/magic.schema";
import { useLocation, Navigate } from "react-router-dom";
import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  AuthErrorInfo,
  classifyAuthError,
  extractAuthError,
} from "@/utils/auth-error.util";
import { useCountdown } from "@/hooks/useCountdown";

const SECTION_ID = "magic";
const RESEND_COOLDOWN_SECONDS = 30;
const CODE_ERROR_KINDS = ["INVALID_CODE", "CODE_EXPIRED", "CODE_LOCKED_OUT"];

type LocationState = {
  email?: string;
  isEmailVerification?: boolean;
};

type Pending = "verify" | "resend" | null;

export const MagicPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const location = useLocation();

  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);
  const [resent, setResent] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const { secondsLeft: cooldown, start: startCooldown } = useCountdown();
  const otpRef = useRef<OtpInputHandle>(null);

  const state = (location.state as LocationState) ?? {};
  const email = state.email!;
  const isEmailVerification = state.isEmailVerification;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    setValue,
  } = useForm<MagicFormValues>({
    resolver: yupResolver(MagicSchema),
    values: {
      email: email,
      code: "",
    },
  });

  const { mutate, isLoading } = useMagic();

  const presentError = (errorCode?: string, retryAfterSeconds?: number) => {
    const info = classifyAuthError(errorCode, retryAfterSeconds);
    setResent(false);
    setAuthError(info);
    setValue("code", "");
    otpRef.current?.focus();
    if (info.kind === "RATE_LIMITED" && retryAfterSeconds) {
      startCooldown(retryAfterSeconds);
    }
  };

  const verify = (code: string) => {
    if (isLoading) return;
    setPending("verify");
    mutate(
      { email, code },
      {
        onSuccess: (response) => {
          if (response.success) {
            const user = response.data!.user!;
            login(user);
            toast.success(
              `${t("page.magic.welcome_user", {
                username: user.name ?? user.email,
              })}.`,
            );
            reset();
            router.navigate(
              isEmailVerification ? ROUTES.HELP : ROUTES.PLAYLISTS,
            );
          } else {
            presentError(response.errorCode, response.retryAfterSeconds);
          }
        },
        onError: (error) => {
          const { errorCode, retryAfterSeconds } = extractAuthError(error);
          presentError(errorCode, retryAfterSeconds);
        },
        onSettled: () => setPending(null),
      },
    );
  };

  const handleResend = () => {
    if (isLoading) return;
    if (cooldown > 0) {
      setResent(false);
      setAuthError({
        kind: "RATE_LIMITED",
        variant: "warning",
        titleKey: "page.auth.error.rate_limited_title",
        messageKey: "page.auth.resend_too_soon",
        canResend: false,
        canRetry: false,
      });
      return;
    }
    setPending("resend");
    mutate(
      { email },
      {
        onSuccess: (response) => {
          if (response.success === false) {
            presentError(response.errorCode, response.retryAfterSeconds);
            return;
          }
          setAuthError(null);
          setResent(true);
          setValue("code", "");
          startCooldown(RESEND_COOLDOWN_SECONDS);
          otpRef.current?.focus();
        },
        onError: (error) => {
          const { errorCode, retryAfterSeconds } = extractAuthError(error);
          presentError(errorCode, retryAfterSeconds);
        },
        onSettled: () => setPending(null),
      },
    );
  };

  const handleStartOver = () => {
    router.navigate(isEmailVerification ? ROUTES.SIGNUP : ROUTES.SIGNIN);
  };

  if (!email) {
    return <Navigate to={ROUTES.SIGNIN} />;
  }

  const resendDisabled = isLoading;
  const codeHasError =
    !!errors.code || (!!authError && CODE_ERROR_KINDS.includes(authError.kind));

  return (
    <Container>
      <Section id={SECTION_ID}>
        <AuthCard
          title={
            isEmailVerification
              ? t("page.magic.title_verification")
              : t("page.magic.title_signin")
          }
          subtitle={t("page.magic.sent_to", { email })}
        >
          <form onSubmit={handleSubmit((data) => verify(data.code))}>
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <OtpInput
                  ref={otpRef}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  hasError={codeHasError}
                  autoFocus
                  disabled={isLoading}
                  onComplete={(code) => verify(code)}
                />
              )}
            />

            <AnimatePresence mode="wait" initial={false}>
              {resent && (
                <AuthAlert
                  key="resent"
                  variant="success"
                  title={t("page.auth.code_resent_title")}
                >
                  {t("page.auth.code_resent_message")}
                </AuthAlert>
              )}
              {authError && (
                <AuthAlert
                  key={authError.kind}
                  variant={authError.variant}
                  title={t(authError.titleKey)}
                  actions={
                    authError.kind === "USER_NOT_FOUND" ? (
                      <AuthAlertActionLink
                        type="button"
                        variant={authError.variant}
                        onClick={() => router.navigate(ROUTES.SIGNUP)}
                      >
                        {t("page.auth.go_to_signup")}
                      </AuthAlertActionLink>
                    ) : undefined
                  }
                >
                  {t(authError.messageKey, {
                    seconds: authError.retryAfterSeconds,
                  })}
                </AuthAlert>
              )}
            </AnimatePresence>

            <Row flex="auto">
              <Button
                type="submit"
                className={
                  isValid && isDirty ? "auth-cta is-ready" : "auth-cta"
                }
                isLoading={pending === "verify" && isLoading}
              >
                {isEmailVerification
                  ? t("page.magic.verify_email")
                  : t("page.magic.signin")}
              </Button>
            </Row>

            <AuthActionsRow>
              <ResendButton
                type="button"
                onClick={handleResend}
                disabled={resendDisabled}
              >
                <ResendIcon $spinning={pending === "resend" && isLoading}>
                  <RotateCw size={16} strokeWidth={2.25} />
                </ResendIcon>
                {t("page.auth.resend_code")}
              </ResendButton>

              <ResendButton type="button" onClick={handleStartOver}>
                {t("page.auth.start_over")}
              </ResendButton>
            </AuthActionsRow>
          </form>
        </AuthCard>
      </Section>
    </Container>
  );
};
