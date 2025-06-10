import router from "@/routes/router";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { User } from "@/types/auth.types";
import { ROUTES } from "@/constants/routes.constants";
import { Spinner } from "@/components/shared/spinner/spinner";
import { Row } from "@/components/shared";
import { useCallback, useEffect } from "react";
import useAuthenticate from "@/api/auth/useAuthenticate";
import { Navigate, useSearchParams } from "react-router-dom";

const SECTION_ID = "authenticate";

export const AuthenticatePage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { mutate } = useAuthenticate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const onAuthenticate = useCallback(() => {
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
            router.navigate(ROUTES.INSTALL);
          } else {
            toast.error(`${t("page.login.error_logging_in")} ${data.message}`);
          }
        },
        onError: () => {
          toast.error(t("page.login.error_logging_in"));
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
        <Row justifyContent="center">
          <Spinner />
        </Row>
      </Section>
    </Container>
  );
};
