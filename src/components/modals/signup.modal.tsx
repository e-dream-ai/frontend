import { yupResolver } from "@hookform/resolvers/yup";
import useSignup from "api/auth/useSignup";
import { Anchor, Button, Checkbox, Input, Modal, Row } from "components/shared";
import { ModalsKeys } from "constants/modal.constants";
import useModal from "hooks/useModal";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import SignupSchema, { SignupFormValues } from "schemas/signup.schema";
import { ModalComponent } from "types/modal.types";

export const SignupModal: React.FC<
  ModalComponent<{
    isOpen?: boolean;
  }>
> = ({ isOpen = false }) => {
  const { t } = useTranslation();
  const { showModal, hideModal } = useModal();
  const handleHideModal = () => hideModal(ModalsKeys.SIGNUP_MODAL);
  const handleOpenLoginModal = () => {
    hideModal(ModalsKeys.SIGNUP_MODAL);
    showModal(ModalsKeys.LOGIN_MODAL);
  };
  const handleOpenForgotPasswordModal = () => {
    hideModal(ModalsKeys.SIGNUP_MODAL);
    showModal(ModalsKeys.FORGOT_PASSWORD_MODAL);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignupFormValues>({
    resolver: yupResolver(SignupSchema),
  });

  const { mutate, isLoading } = useSignup();

  const onSubmit = (data: SignupFormValues) => {
    mutate(
      {
        username: data.username,
        email: data.username,
        password: data.password,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(t("modal.signup.user_signup_successfully"));
            reset();
            handleHideModal();
          } else {
            toast.error(
              `${t("modal.signup.error_signingup_user")} ${data.message}`,
            );
          }
        },
        onError: () => {
          toast.error(t("modal.signup.error_signingup_user"));
        },
      },
    );
  };

  return (
    <Modal
      title={t("modal.signup.title")}
      isOpen={isOpen}
      hideModal={handleHideModal}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder={t("modal.signup.email")}
          type="email"
          before={<i className="fa fa-envelope" />}
          error={errors.username?.message}
          {...register("username")}
        />
        <Input
          placeholder={t("modal.signup.password")}
          type="password"
          before={<i className="fa fa-lock" />}
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          placeholder={t("modal.signup.confirm_password")}
          type="password"
          before={<i className="fa fa-lock" />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Row justifyContent="space-between">
          <Row>
            <Checkbox {...register("terms")} error={errors.terms?.message}>
              {t("modal.signup.agree_to")}{" "}
              <Anchor target="_blank" href="/tos">
                {t("modal.signup.terms_of_service")}
              </Anchor>
            </Checkbox>
          </Row>
          <Button
            type="submit"
            after={<i className="fa fa-angle-right" />}
            isLoading={isLoading}
          >
            {t("modal.signup.next")}
          </Button>
        </Row>

        <Row justifyContent="space-between">
          <Anchor onClick={handleOpenLoginModal}>
            {t("modal.signup.already_have_account")}
          </Anchor>
          <Anchor onClick={handleOpenForgotPasswordModal}>
            {t("modal.signup.forgot_your_password")}
          </Anchor>
        </Row>
      </form>
    </Modal>
  );
};
