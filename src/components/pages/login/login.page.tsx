import router from "@/routes/router";
import useLogin from "@/api/auth/useLogin";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import {
  AnchorLink,
  AuthAlert,
  AuthCard,
  AuthFooterLinks,
  Button,
  Input,
  Row,
} from "@/components/shared";
// import InputPassword from "@/components/shared/input-password/input-password";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as yup from "yup";
import {
  LoginFormValues,
  LoginSchema,
  MagicLoginFormValues,
  MagicLoginSchema,
} from "@/schemas/login.schema";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope /* , faLock */ } from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "@/constants/routes.constants";
// import useModal from "@/hooks/useModal";
// import { ModalsKeys } from "@/constants/modal.constants";
import useMagic from "@/api/auth/useMagic";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  AuthErrorInfo,
  classifyAuthError,
  extractAuthError,
} from "@/utils/auth-error.util";

type SubmitType = "login" | "magic";

const SECTION_ID = "login";

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  // const { showModal } = useModal();
  const { login } = useAuth();

  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);

  const {
    formState: { errors, isValid, isDirty },
    reset,
    register,
    handleSubmit,
    clearErrors,
    setError,
  } = useForm<MagicLoginFormValues>({
    resolver: yupResolver(MagicLoginSchema),
  });

  const { mutate, isLoading } = useLogin();
  const { mutate: mutateMagic, isLoading: isMagicLoading } = useMagic();

  // const handleOpenForgotPasswordModal = () => {
  //   showModal(ModalsKeys.FORGOT_PASSWORD_MODAL);
  // };

  const onSubmit =
    (submitType: SubmitType) =>
    async (data: LoginFormValues | MagicLoginFormValues) => {
      clearErrors();
      setAuthError(null);
      const schema = submitType === "login" ? LoginSchema : MagicLoginSchema;

      try {
        await schema.validate(data, { abortEarly: false });

        if (submitType === "login" && "password" in data) {
          handleLogin(data.email, data.password);
        } else {
          handleMagicLogin(data.email);
        }
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          error.inner.forEach((err) => {
            if (err.path) {
              setError(err.path as keyof MagicLoginFormValues, {
                type: "manual",
                message: err.message,
              });
            }
          });
        } else {
          // Handle unexpected errors
        }
      }
    };

  const handleLogin = (email: string, password: string) => {
    mutate(
      { email, password },
      {
        onSuccess: (data) => {
          if (data.success) {
            const user = data.data!.user;
            login(user);
            toast.success(
              `${t("page.login.welcome_user", {
                username: user.name ?? user.email,
              })}.`,
            );
            reset();
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
  };

  const handleMagicLogin = async (email: string) => {
    mutateMagic(
      { email },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(t("page.login.email_code_sent"));
            reset();
            router.navigate(ROUTES.MAGIC, {
              state: {
                email,
              },
            });
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
  };

  return (
    <Container>
      <Section id={SECTION_ID}>
        <AuthCard
          title={t("page.login.title")}
          subtitle={t("page.login.subtitle")}
        >
          <form onSubmit={handleSubmit(onSubmit("magic"))}>
            <Input
              placeholder={t("page.login.email")}
              type="email"
              autoComplete="email"
              before={<FontAwesomeIcon icon={faEnvelope} />}
              error={errors.email?.message}
              {...register("email")}
            />
            {/* <InputPassword
              placeholder={t("page.login.password")}
              before={<FontAwesomeIcon icon={faLock} />}
              error={errors.password?.message}
              {...register("password")}
            /> */}

            <AnimatePresence mode="wait" initial={false}>
              {authError && (
                <AuthAlert
                  key={authError.kind}
                  variant={authError.variant}
                  title={t(authError.titleKey)}
                >
                  {t(authError.messageKey, {
                    seconds: authError.retryAfterSeconds,
                  })}
                </AuthAlert>
              )}
            </AnimatePresence>

            {/* <Row flex="auto">
              <Button
                onClick={handleSubmit(onSubmit("login"))}
                isLoading={isLoading}
                disabled={isMagicLoading}
              >
                {t("page.login.login")}
              </Button>
            </Row> */}

            {/* <Row flex="auto" justifyContent="center">
              {t("page.login.or")}
            </Row> */}

            <Row flex="auto">
              <Button
                type="submit"
                className={
                  isValid && isDirty ? "auth-cta is-ready" : "auth-cta"
                }
                isLoading={isMagicLoading}
                disabled={isLoading}
              >
                {t("page.login.magic_login")}
              </Button>
            </Row>

            <AuthFooterLinks>
              <AnchorLink to={ROUTES.SIGNUP}>
                {t("page.login.dont_have_account")}
              </AnchorLink>
            </AuthFooterLinks>
          </form>
        </AuthCard>
      </Section>
    </Container>
  );
};
