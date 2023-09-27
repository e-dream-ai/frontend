import { yupResolver } from "@hookform/resolvers/yup";
import useSignup from "api/auth/useSignup";
import { Anchor, Button, Checkbox, Input, Modal, Row } from "components/shared";
import { ModalsKeys } from "constants/modal.constants";
import useModal from "hooks/useModal";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import SignupSchema, { SignupFormValues } from "schemas/signup.schema";
import { ModalComponent } from "types/modal.types";

export const SignupModal: React.FC<
  ModalComponent<{
    isOpen?: boolean;
  }>
> = ({ isOpen = false }) => {
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
            toast.success(
              "User signup successfull. Check your email to verify user.",
            );
            reset();
            handleHideModal();
          } else {
            toast.error(`Error signing up user. ${data.message}`);
          }
        },
        onError: () => {
          toast.error("Error signing up user.");
        },
      },
    );
  };

  return (
    <Modal title="Sign up for gold" isOpen={isOpen} hideModal={handleHideModal}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder="Email"
          type="email"
          before={<i className="fa fa-envelope" />}
          error={errors.username?.message}
          {...register("username")}
        />
        <Input
          placeholder="Password"
          type="password"
          before={<i className="fa fa-lock" />}
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          placeholder="Confirm Password"
          type="password"
          before={<i className="fa fa-lock" />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Row justifyContent="space-between">
          <Row>
            <Checkbox {...register("terms")} error={errors.terms?.message}>
              I agree to the <Anchor>Terms of Service</Anchor>
            </Checkbox>
          </Row>
          <Button
            type="submit"
            after={<i className="fa fa-angle-right" />}
            isLoading={isLoading}
          >
            Next
          </Button>
        </Row>

        <Row justifyContent="space-between">
          <Anchor onClick={handleOpenLoginModal}>
            Already have an account?
          </Anchor>
          <Anchor onClick={handleOpenForgotPasswordModal}>
            Forgot your password?
          </Anchor>
        </Row>
      </form>
    </Modal>
  );
};
