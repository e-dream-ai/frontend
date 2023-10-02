import { yupResolver } from "@hookform/resolvers/yup";
import useLogin from "api/auth/useLogin";
import { Anchor, Button, Input, Modal, Row } from "components/shared";
import InputPassword from "components/shared/input-password/input-password";
import { ModalsKeys } from "constants/modal.constants";
import { useAuth } from "hooks/useAuth";
import useModal from "hooks/useModal";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import LoginSchema, { LoginFormValues } from "schemas/login.schema";
import { User } from "types/auth.types";
import { ModalComponent } from "types/modal.types";

export const LoginModal: React.FC<
  ModalComponent<{
    isOpen?: boolean;
  }>
> = ({ isOpen = false }) => {
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
            const user: User = data.data as User;
            login(user);
            toast.success(
              `User logged in successfully. Welcome ${user.email} .`,
            );
            reset();
            handleHideModal();
          } else {
            toast.error(`Error logging in. ${data.message}`);
          }
        },
        onError: () => {
          toast.error("Error logging in.");
        },
      },
    );
  };

  return (
    <Modal title="Login" isOpen={isOpen} hideModal={handleHideModal}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder="Email"
          type="email"
          before={<i className="fa fa-envelope" />}
          error={errors.username?.message}
          {...register("username")}
        />
        <InputPassword
          placeholder="Password"
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
            Login
          </Button>
        </Row>

        <Row>
          <Anchor onClick={handleSignupModal}>
            Don&apos;t have an account?
          </Anchor>
        </Row>
        <Row>
          <Anchor onClick={handleOpenForgotPasswordModal}>
            Forgot your password?
          </Anchor>
        </Row>
      </form>
    </Modal>
  );
};
