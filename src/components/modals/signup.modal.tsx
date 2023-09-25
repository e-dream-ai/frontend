import { yupResolver } from "@hookform/resolvers/yup";
import useSignup from "api/auth/useSignup";
import { Anchor, Button, Input, Modal, Row } from "components/shared";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import SignupSchema, { SignupFormValues } from "schemas/signup.schema";

export const SignupModal: React.FC<{
  isOpen?: boolean;
  showModal?: () => void;
  hideModal?: () => void;
}> = ({ isOpen = false, showModal, hideModal }) => {
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
        onSuccess: () => {
          toast.success(
            "User signup successfull. Check your email to verify user.",
          );
          reset();
          hideModal?.();
        },
        onError: () => {
          toast.error("Error signing up user.");
        },
      },
    );
  };

  return (
    <Modal
      title="Sign up for gold"
      isOpen={isOpen}
      showModal={showModal}
      hideModal={hideModal}
    >
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

        <Row justifyContent="flex-end">
          <Button
            type="submit"
            after={<i className="fa fa-angle-right" />}
            isLoading={isLoading}
          >
            Next
          </Button>
        </Row>

        <Anchor>Don&apos;t have an account?</Anchor>
        <Anchor>Forgot your password?</Anchor>
      </form>
    </Modal>
  );
};
