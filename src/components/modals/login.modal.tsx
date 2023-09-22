import { yupResolver } from "@hookform/resolvers/yup";
import useLogin from "api/auth/useLogin";
import { Anchor, Button, Input, Modal, Row } from "components/shared";
import { useAuth } from "hooks/useAuth";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import LoginSchema, { LoginFormValues } from "schemas/login.schema";
import { User } from "types/auth.types";

export const LoginModal: React.FC<{
  isOpen?: boolean;
  showModal?: () => void;
  hideModal?: () => void;
}> = ({ isOpen = false, showModal, hideModal }) => {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(LoginSchema),
  });

  const { mutate, isLoading } = useLogin();

  const onSubmit = (data: LoginFormValues) => {
    mutate(
      { username: data.username, password: data.password },
      {
        onSuccess: (data) => {
          const user: User = data.data as User;
          login(user);
          toast.success(`User logged in successfully. Welcome ${user.email}`);
          hideModal?.();
        },
      },
    );
  };

  return (
    <Modal title="Login" isOpen={isOpen} hideModal={hideModal}>
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

        <Row justifyContent="flex-end">
          <Button
            type="submit"
            after={<i className="fa fa-angle-right" />}
            isLoading={isLoading}
          >
            Login
          </Button>
        </Row>

        <Anchor>Don&apos;t have an account?</Anchor>
        <Anchor>Forgot your password?</Anchor>
      </form>
    </Modal>
  );
};
