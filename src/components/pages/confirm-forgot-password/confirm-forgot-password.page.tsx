import { yupResolver } from "@hookform/resolvers/yup";
import useConfirmForgotPassword from "api/auth/useConfirmForgotPassword";
import { Button, Input, Row } from "components/shared";
import Container from "components/shared/container/container";
import { ROUTES } from "constants/routes.constants";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmForgotPasswordSchema, {
  ConfirmForgotPasswordFormValues,
} from "schemas/confirm-forgot-password.schema";

export const ConfirmForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username }: { username: string } = location.state;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmForgotPasswordFormValues>({
    resolver: yupResolver(ConfirmForgotPasswordSchema),
  });

  const { mutate, isLoading } = useConfirmForgotPassword();

  const onSubmit = (data: ConfirmForgotPasswordFormValues) => {
    mutate(
      { username: username, code: data.code, password: data.password },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("Password changed successfully");
            navigate(ROUTES.ROOT);
          } else {
            toast.error(`Error changing user password. ${data.message}`);
          }
        },
        onError: () => {
          toast.error("Error changing user password.");
        },
      },
    );
  };

  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder="Code"
          type="text"
          before={<i className="fa fa-key" />}
          error={errors.code?.message}
          {...register("code")}
        />

        <Input
          placeholder="New Password"
          type="password"
          before={<i className="fa fa-lock" />}
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          placeholder="Confirm New Password"
          type="password"
          before={<i className="fa fa-lock" />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Row justifyContent="flex-start">
          <Button
            type="submit"
            isLoading={isLoading}
            after={<i className="fa fa-angle-right" />}
          >
            Verify account
          </Button>
        </Row>
      </form>
    </Container>
  );
};

export default ConfirmForgotPassword;
