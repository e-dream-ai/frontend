import useUnsubscribeMarketing, {
  UnsubscribeMarketingResponse,
} from "@/api/marketing/useUnsubscribeMarketing";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { Anchor, Button, Row, Text } from "@/components/shared";
import { ROUTES } from "@/constants/routes.constants";
import { ApiResponse } from "@/types/api.types";
import useAuth from "@/hooks/useAuth";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

const SECTION_ID = "unsubscribe";

type UnsubscribeState =
  | "missing_token"
  | "confirm"
  | "wrong_account"
  | "unsubscribed"
  | "already_unsubscribed"
  | "error";

const decodeTokenEmail = (token: string): string | null => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return typeof payload.email === "string" ? payload.email : null;
  } catch {
    return null;
  }
};

export const UnsubscribePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = (searchParams.get("token") ?? "").trim();
  const [state, setState] = useState<UnsubscribeState>(
    token ? "confirm" : "missing_token",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const { user, isLoading: isAuthLoading } = useAuth();
  const { mutateAsync, isLoading } = useUnsubscribeMarketing();

  useEffect(() => {
    if (isAuthLoading) return;

    if (!token) {
      setState("missing_token");
      setErrorMessage("");
      return;
    }

    if (user) {
      const tokenEmail = decodeTokenEmail(token);
      if (tokenEmail && tokenEmail !== user.email) {
        setState("wrong_account");
        setErrorMessage("");
        return;
      }
    }

    setState("confirm");
    setErrorMessage("");
  }, [token, user, isAuthLoading]);

  const handleGoHome = () => navigate(ROUTES.ROOT);

  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<
        ApiResponse<UnsubscribeMarketingResponse>
      >;
      return (
        axiosError.response?.data?.message ||
        axiosError.message ||
        t("page.unsubscribe.error_message")
      );
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return t("page.unsubscribe.error_message");
  };

  const handleConfirmUnsubscribe = async () => {
    if (!token) {
      setState("missing_token");
      return;
    }

    setErrorMessage("");

    try {
      const response = await mutateAsync({ token });

      if (!response.success) {
        setState("error");
        setErrorMessage(
          response.message ?? t("page.unsubscribe.error_message"),
        );
        return;
      }

      if (response.data?.status === "already_unsubscribed") {
        setState("already_unsubscribed");
        return;
      }

      setState("unsubscribed");
    } catch (error: unknown) {
      setState("error");
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <Container>
      <Section id={SECTION_ID}>
        <h2>{t("page.unsubscribe.title")}</h2>

        {state === "missing_token" && (
          <Text>{t("page.unsubscribe.missing_token_message")}</Text>
        )}

        {state === "wrong_account" && (
          <Text>{t("page.unsubscribe.wrong_account_message")}</Text>
        )}

        {state === "confirm" && (
          <>
            <Text>{t("page.unsubscribe.confirm_message")}</Text>
            <Row mt={3}>
              <Button
                buttonType="secondary"
                isLoading={isLoading}
                onClick={handleConfirmUnsubscribe}
              >
                {t("page.unsubscribe.confirm_button")}
              </Button>
            </Row>
          </>
        )}

        {state === "unsubscribed" && (
          <Text>{t("page.unsubscribe.success_message")}</Text>
        )}

        {state === "already_unsubscribed" && (
          <Text>{t("page.unsubscribe.already_message")}</Text>
        )}

        {state === "error" && <Text>{errorMessage}</Text>}

        <Row mt={3}>
          <Anchor onClick={handleGoHome}>
            {t("page.unsubscribe.go_home")}
          </Anchor>
        </Row>
      </Section>
    </Container>
  );
};

export default UnsubscribePage;
