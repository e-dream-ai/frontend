import { yupResolver } from "@hookform/resolvers/yup";
import router from "@/routes/router";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { Button, Input, Row, Text } from "@/components/shared";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "@/constants/routes.constants";
import { StyledMagic } from "./magic.styled";
import useMagic from "@/api/auth/useMagic";
import MagicSchema, { MagicFormValues } from "@/schemas/magic.schema";
import { useLocation, Navigate } from "react-router-dom";
import { useTheme } from "styled-components";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/api.types";

const SECTION_ID = "magic";
const CODE_EXPIRED_MODAL_TITLE = "Code expired";
const CODE_EXPIRED_MODAL_TEXT = "Code expired, try again.";
const CODE_EXPIRED_MODAL_CONFIRM = "OK";

type LocationState = {
  email?: string;
  isEmailVerification?: boolean;
};

export const MagicPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const [showCodeExpiredModal, setShowCodeExpiredModal] = useState(false);

  const state = location.state as LocationState;
  const email = state.email!;
  const isEmailVerification = state.isEmailVerification;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<MagicFormValues>({
    resolver: yupResolver(MagicSchema),
    values: {
      email: email,
      code: "",
    },
  });

  const { mutate, isLoading } = useMagic();

  const handleExpiredCodeConfirm = () => {
    setShowCodeExpiredModal(false);
    router.navigate(ROUTES.SIGNIN);
  };

  const getErrorToast = (errorCode?: string, retryAfterSeconds?: number) => {
    switch (errorCode) {
      case "INVALID_CODE":
        return t("page.magic.error_invalid_code");
      case "CODE_EXPIRED":
        return null;
      case "CODE_LOCKED_OUT":
        return t("page.magic.error_code_locked");
      case "RATE_LIMITED":
        return retryAfterSeconds
          ? t("page.magic.error_rate_limited", { seconds: retryAfterSeconds })
          : t("page.magic.error_rate_limited_generic");
      case "USER_NOT_FOUND":
        return t("page.magic.error_user_not_found");
      case "BAD_REQUEST":
        return t("page.magic.error_bad_request");
      default:
        return t("page.magic.error_verifying_code");
    }
  };

  const handleAuthError = (errorCode?: string, retryAfterSeconds?: number) => {
    if (errorCode === "CODE_EXPIRED") {
      setShowCodeExpiredModal(true);
      return;
    }
    const message = getErrorToast(errorCode, retryAfterSeconds);
    if (message) toast.error(message);
  };

  const onSubmit = (data: MagicFormValues) => {
    mutate(
      { email: data.email, code: data.code },
      {
        onSuccess: (data) => {
          if (data.success) {
            const user = data.data!.user!;
            login(user);
            toast.success(
              `${t("page.magic.welcome_user", {
                username: user.name ?? user.email,
              })}.`,
            );
            reset();
            if (isEmailVerification) {
              router.navigate(ROUTES.HELP);
            } else {
              router.navigate(ROUTES.PLAYLISTS);
            }
          } else {
            handleAuthError(data.errorCode, data.retryAfterSeconds);
          }
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ApiResponse<unknown>>;
            const { errorCode, retryAfterSeconds } =
              axiosError.response?.data ?? {};
            handleAuthError(errorCode, retryAfterSeconds);
            return;
          }
          toast.error(t("page.magic.error_verifying_code"));
        },
      },
    );
  };

  if (!email) {
    return <Navigate to={ROUTES.SIGNIN} />;
  }

  return (
    <>
      <ConfirmModal
        isOpen={showCodeExpiredModal}
        onCancel={handleExpiredCodeConfirm}
        onConfirm={handleExpiredCodeConfirm}
        title={CODE_EXPIRED_MODAL_TITLE}
        confirmText={CODE_EXPIRED_MODAL_CONFIRM}
        cancelText=""
        text={<Text>{CODE_EXPIRED_MODAL_TEXT}</Text>}
      />
      <Container>
        <Section id={SECTION_ID}>
          <StyledMagic>
            <Row alignContent="flex-start">
              <h2>
                {isEmailVerification
                  ? t("page.magic.title_verification")
                  : t("page.magic.title_signin")}
              </h2>
            </Row>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Text mb={3} fontSize="1rem" color={theme.textSecondaryColor}>
                {isEmailVerification
                  ? t("page.magic.instructions_verification")
                  : t("page.magic.instructions_signin")}
              </Text>

              <Input
                disabled
                value={email}
                placeholder={t("page.magic.email")}
                before={<FontAwesomeIcon icon={faEnvelope} />}
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={t("page.magic.code")}
                before={<FontAwesomeIcon icon={faLock} />}
                error={errors.code?.message}
                {...register("code")}
              />

              <Row flex="auto">
                <Button
                  type="submit"
                  buttonType={isValid && isDirty ? "secondary" : "primary"}
                  isLoading={isLoading}
                  style={{ width: "-webkit-fill-available" }}
                >
                  {isEmailVerification
                    ? t("page.magic.verify_email")
                    : t("page.magic.signin")}
                </Button>
              </Row>
            </form>
          </StyledMagic>
        </Section>
      </Container>
    </>
  );
};
