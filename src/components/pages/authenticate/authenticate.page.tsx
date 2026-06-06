import router from "@/routes/router";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { User } from "@/types/auth.types";
import { ROUTES } from "@/constants/routes.constants";
import { Spinner } from "@/components/shared/spinner/spinner";
import { AuthAlert, AuthAlertActionLink, AuthCard } from "@/components/shared";
import { useCallback, useEffect, useState } from "react";
import useAuthenticate from "@/api/auth/useAuthenticate";
import { Navigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  AuthErrorInfo,
  classifyAuthError,
  extractAuthError,
} from "@/utils/auth-error.util";
import { VerifyingBlock } from "./authenticate.styled";

const SECTION_ID = "authenticate";

export const AuthenticatePage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { mutate } = useAuthenticate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);

  const onAuthenticate = useCallback(() => {
    setAuthError(null);
    mutate(
      { code: code! },
      {
        onSuccess: (data) => {
          if (data.success) {
            const user: User = data.data!.user;
            login(user);
            toast.success(
              `${t("page.login.welcome_user", {
                username: user.name ?? user.email,
              })}.`,
            );
            router.navigate(ROUTES.PLAYLISTS);
          } else {
            setAuthError(
              classifyAuthError(data.errorCode, data.retryAfterSeconds),
            );
          }
        },
        onError: (error) => {
          const { errorCode, retryAfterSeconds } = extractAuthError(error);
          setAuthError(classifyAuthError(errorCode, retryAfterSeconds));
        },
      },
    );
  }, [code, t, login, mutate]);

  useEffect(() => {
    onAuthenticate();
  }, [onAuthenticate]);

  if (!code) {
    return <Navigate to={ROUTES.SIGNIN} replace />;
  }

  return (
    <Container>
      <Section id={SECTION_ID}>
        <AuthCard>
          <AnimatePresence mode="wait" initial={false}>
            {authError ? (
              <AuthAlert
                key={authError.kind}
                variant={authError.variant}
                title={t(authError.titleKey)}
                actions={
                  <>
                    {authError.canRetry && (
                      <AuthAlertActionLink
                        type="button"
                        variant={authError.variant}
                        onClick={onAuthenticate}
                      >
                        {t("page.auth.try_again")}
                      </AuthAlertActionLink>
                    )}
                    <AuthAlertActionLink
                      type="button"
                      variant={authError.variant}
                      onClick={() => router.navigate(ROUTES.SIGNIN)}
                    >
                      {t("page.auth.go_to_signin")}
                    </AuthAlertActionLink>
                  </>
                }
              >
                {t(authError.messageKey, {
                  seconds: authError.retryAfterSeconds,
                })}
              </AuthAlert>
            ) : (
              <VerifyingBlock key="verifying">
                <Spinner />
                <span>{t("page.auth.verifying")}</span>
              </VerifyingBlock>
            )}
          </AnimatePresence>
        </AuthCard>
      </Section>
    </Container>
  );
};
