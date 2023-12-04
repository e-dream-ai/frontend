import { yupResolver } from "@hookform/resolvers/yup";
import useLogin from "api/auth/useLogin";
import { Anchor, Button, Input, Modal, Row } from "components/shared";
import InputPassword from "components/shared/input-password/input-password";
import { ModalsKeys } from "constants/modal.constants";
import { useAuth } from "hooks/useAuth";
import useModal from "hooks/useModal";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import LoginSchema, { LoginFormValues } from "schemas/login.schema";
import { UserWithToken } from "types/auth.types";
import { ModalComponent } from "types/modal.types";

export const LoginModal: React.FC<
  ModalComponent<{
    isOpen?: boolean;
  }>
> = ({ isOpen = false }) => {
  const { t } = useTranslation();
  const { showModal, hideModal } = useModal();
  const handleHideModal = () => hideModal(ModalsKeys.LOGIN_MODAL);
  const handleSignupModal = () => {
    hideModal(ModalsKeys.LOGIN_MODAL);
    showModal(ModalsKeys.SIGNUP_MODAL);
  };
  const handleOpenForgotPasswordModal = () => {
    hideModal(ModalsKeys.LOGIN_MODAL);
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
              `${t("modal.login.user_logged_successfully")} ${t(
                "modal.login.welcome_user",
                { username: user.email },
              )}`,
            );
            reset();
            handleHideModal();
          } else {
            toast.error(`${t("modal.login.error_logging_in")} ${data.message}`);
          }
        },
        onError: (error) => {
          toast.error(t("modal.login.error_logging_in"));
        },
      },
    );
  };

  return (
    <Modal
      title={t("modal.login.title")}
      isOpen={isOpen}
      hideModal={handleHideModal}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder={t("modal.login.email")}
          type="email"
          before={<i className="fa fa-envelope" />}
          error={errors.username?.message}
          {...register("username")}
        />
        <InputPassword
          placeholder={t("modal.login.password")}
          before={<i className="fa fa-lock" />}
          error={errors.password?.message}
          {...register("password")}
        />

        <Row justifyContent="flex-end">
          <Button
            type="submit"
            after={<i className="fa fa-angle-right" />}
            isLoading={isLoading}
          >
            {t("modal.login.login")}
          </Button>
        </Row>

        <Row>
          <Anchor onClick={handleSignupModal}>
            {t("modal.login.dont_have_account")}
          </Anchor>
        </Row>
        <Row>
          <Anchor onClick={handleOpenForgotPasswordModal}>
            {t("modal.login.forgot_your_password")}
          </Anchor>
        </Row>
      </form>
    </Modal>
  );
};
