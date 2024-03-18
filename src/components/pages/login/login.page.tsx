import { yupResolver } from "@hookform/resolvers/yup";
import router from "@/routes/router";
import useLogin from "@/api/auth/useLogin";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { Anchor, Button, Column, Input, Row } from "@/components/shared";
import InputPassword from "@/components/shared/input-password/input-password";
import { ModalsKeys } from "@/constants/modal.constants";
import { ROLES_NAMES } from "@/constants/role.constants";
import { useAuth } from "@/hooks/useAuth";
import useModal from "@/hooks/useModal";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import LoginSchema, { LoginFormValues } from "@/schemas/login.schema";
import { UserWithToken } from "@/types/auth.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "@/constants/routes.constants";
import { StyledLogin } from "./login.styled";

const SECTION_ID = "login";

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { showModal } = useModal();

  const handleOpenForgotPasswordModal = () => {
    showModal(ModalsKeys.FORGOT_PASSWORD_MODAL);
  };

  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({
    resolver: yupResolver(LoginSchema),
  });

  const { mutate, isLoading } = useLogin();

  const onSubmit = (data: LoginFormValues) => {
    mutate(
      { username: data.username, password: data.password },
      {
        onSuccess: (data) => {
          if (data.success) {
            const user: UserWithToken = data.data as UserWithToken;
            login(user);
            toast.success(
              `${t("page.login.user_logged_successfully", {
                role: t(ROLES_NAMES[user?.role?.name ?? ""]),
              })} ${t("page.login.welcome_user", { username: user.email })}`,
            );
            reset();
            router.navigate(ROUTES.FEED);
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

  return (
    <Container>
      <Section id={SECTION_ID}>
        <StyledLogin>
          <Row alignContent="flex-start">
            <h2>{t("page.login.title")}</h2>
          </Row>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              placeholder={t("page.login.email")}
              type="email"
              before={<FontAwesomeIcon icon={faEnvelope} />}
              error={errors.username?.message}
              {...register("username")}
            />
            <InputPassword
              placeholder={t("page.login.password")}
              before={<FontAwesomeIcon icon={faLock} />}
              error={errors.password?.message}
              {...register("password")}
            />

            <Row justifyContent="space-between" mb="0.4rem">
              <Column>
                <Row mb="0.6rem">
                  <Anchor href="/signup">
                    {t("page.login.dont_have_account")}
                  </Anchor>
                </Row>
                <Row mb="0.4rem">
                  <Anchor onClick={handleOpenForgotPasswordModal}>
                    {t("page.login.forgot_your_password")}
                  </Anchor>
                </Row>
              </Column>

              <Button
                type="submit"
                after={<FontAwesomeIcon icon={faAngleRight} />}
                isLoading={isLoading}
              >
                {t("page.login.login")}
              </Button>
            </Row>

            <Row justifyContent="flex-end"></Row>
          </form>
        </StyledLogin>
      </Section>
    </Container>
  );
};
