import { yupResolver } from "@hookform/resolvers/yup";
import useConfirmForgotPassword from "api/auth/useConfirmForgotPassword";
import { Button, Input, Row } from "components/shared";
import Container from "components/shared/container/container";
import { ROUTES } from "constants/routes.constants";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmForgotPasswordSchema, {
  ConfirmForgotPasswordFormValues,
} from "schemas/confirm-forgot-password.schema";

export const ConfirmForgotPassword: React.FC = () => {
  const { t } = useTranslation();
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
            toast.success(
              t("page.confirm_forgot_password.password_change_successfully"),
            );
            navigate(ROUTES.ROOT);
          } else {
            toast.error(
              `${t("page.confirm_forgot_password.error_changing_password")} ${
                data.message
              }`,
            );
          }
        },
        onError: () => {
          toast.error(
            t("page.confirm_forgot_password.error_changing_password"),
          );
        },
      },
    );
  };

  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder={t("page.confirm_forgot_password.codes")}
          type="text"
          before={<i className="fa fa-key" />}
          error={errors.code?.message}
          {...register("code")}
        />

        <Input
          placeholder={t("page.confirm_forgot_password.new_password")}
          type="password"
          before={<i className="fa fa-lock" />}
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          placeholder={t("page.confirm_forgot_password.confirm_new_password")}
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
            {t("page.confirm_forgot_password.change_password")}
          </Button>
        </Row>
      </form>
    </Container>
  );
};

export default ConfirmForgotPassword;
