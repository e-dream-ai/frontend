import { yupResolver } from "@hookform/resolvers/yup";
import useVerifyEmail from "api/auth/useVerifyEmail";
import { Button, Input, Row } from "components/shared";
import Container from "components/shared/container/container";
import { useForm } from "react-hook-form";
import VerifyEmailSchema, {
  VerifyEmailFormValues,
} from "schemas/verify-email.schema";

export const VerifyEmailPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    resolver: yupResolver(VerifyEmailSchema),
  });

  const { mutate, isLoading } = useVerifyEmail();

  const onSubmit = (data: VerifyEmailFormValues) => {
    mutate({ username: data.email ?? "", code: data.code });
  };

  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder="Email"
          type="email"
          before={<i className="fa fa-envelope" />}
          error={errors.email?.message}
          {...register("code")}
        />
        <Input
          placeholder="Code"
          type="text"
          before={<i className="fa fa-envelope" />}
          error={errors.code?.message}
          {...register("code")}
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

export default VerifyEmailPage;
