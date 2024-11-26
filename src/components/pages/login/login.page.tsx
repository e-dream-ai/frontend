import router from "@/routes/router";
import useLogin from "@/api/auth/useLogin";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { Anchor, Button, Input, Row } from "@/components/shared";
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
import { StyledLogin } from "./login.styled";
// import useModal from "@/hooks/useModal";
// import { ModalsKeys } from "@/constants/modal.constants";
import useMagic from "@/api/auth/useMagic";

type SubmitType = "login" | "magic";

const SECTION_ID = "login";

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  // const { showModal } = useModal();
  const { login } = useAuth();

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
            toast.error(`${t("page.login.error_logging_in")} ${data.message}`);
          }
        },
        onError: () => {
          toast.error(t("page.login.error_logging_in"));
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
            toast.error(
              `${t("page.login.error_sending_code")} ${data.message}`,
            );
          }
        },
        onError: () => {
          toast.error(t("page.login.error_sending_code"));
        },
      },
    );
  };

  return (
    <Container>
      <Section id={SECTION_ID}>
        <StyledLogin>
          <Row alignContent="flex-start">
            <h2>{t("page.login.title")}</h2>
          </Row>

          <form onSubmit={handleSubmit(onSubmit("login"))}>
            <Input
              placeholder={t("page.login.email")}
              type="email"
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

            {/* <Row flex="auto">
              <Button
                style={{ width: "-webkit-fill-available" }}
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
                buttonType={isValid && isDirty ? "secondary" : "primary"}
                style={{ width: "-webkit-fill-available" }}
                onClick={handleSubmit(onSubmit("magic"))}
                isLoading={isMagicLoading}
                disabled={isLoading}
              >
                {t("page.login.magic_login")}
              </Button>
            </Row>

            <Row justifyContent="space-between" mb="0.4rem">
              <Anchor href={ROUTES.SIGNUP}>
                {t("page.login.dont_have_account")}
              </Anchor>
            </Row>

            {/* <Row justifyContent="space-between" mb="0.4rem">
              <Anchor onClick={handleOpenForgotPasswordModal}>
                {t("page.login.forgot_your_password")}
              </Anchor>
            </Row> */}
          </form>
        </StyledLogin>
      </Section>
    </Container>
  );
};
