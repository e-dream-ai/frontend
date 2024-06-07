import { yupResolver } from "@hookform/resolvers/yup";
import router from "@/routes/router";
import useSignup from "@/api/auth/useSignup";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import {
  Anchor,
  Button,
  Checkbox,
  Column,
  Input,
  Row,
} from "@/components/shared";
import { ModalsKeys } from "@/constants/modal.constants";
import useModal from "@/hooks/useModal";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { SignupFormValues, getSignupSchema } from "@/schemas/signup.schema";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faEnvelope,
  faKey,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import InputPassword from "@/components/shared/input-password/input-password";
import { ROUTES } from "@/constants/routes.constants";
import { StyledSignup } from "./signup.styled";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnyObject, ObjectSchema } from "yup";
import useSignupFeature from "@/api/feature/hook/useSignupFeature";

const SECTION_ID = "signup";

export const SignupPage: React.FC = () => {
  const { t } = useTranslation();
  const { showModal } = useModal();

  const [searchParams] = useSearchParams();
  const [signupSchema, setSignupSchema] = useState<
    ObjectSchema<SignupFormValues, AnyObject, unknown, "">
  >(getSignupSchema(false));

  const isSignupFeatureActive = useSignupFeature();

  // Get specific search parameters
  const code = isSignupFeatureActive
    ? searchParams.get("invite") ?? ""
    : undefined;
  const email = searchParams.get("email") ?? "";

  const handleOpenForgotPasswordModal = () => {
    showModal(ModalsKeys.FORGOT_PASSWORD_MODAL);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignupFormValues>({
    resolver: yupResolver(signupSchema),
    values: {
      code,
      username: email,
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isLoading } = useSignup();

  const onSubmit = (data: SignupFormValues) => {
    mutate(
      {
        username: data.username,
        email: data.username,
        password: data.password,
        code: data.code,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(t("page.signup.user_signup_successfully"));
            reset();
            router.navigate(ROUTES.LOGIN);
          } else {
            toast.error(
              `${t("page.signup.error_signingup_user")} ${data.message}`,
            );
          }
        },
        onError: () => {
          toast.error(t("page.signup.error_signingup_user"));
        },
      },
    );
  };

  useEffect(() => {
    const generatedSignupSchema = getSignupSchema(isSignupFeatureActive);
    setSignupSchema(generatedSignupSchema);
  }, [isSignupFeatureActive]);

  return (
    <Container>
      <Section id={SECTION_ID}>
        <StyledSignup>
          <Row alignContent="flex-start">
            <h2>{t("page.signup.title")}</h2>
          </Row>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              placeholder={t("page.signup.email")}
              type="email"
              before={<FontAwesomeIcon icon={faEnvelope} />}
              error={errors.username?.message}
              {...register("username")}
            />
            <InputPassword
              placeholder={t("page.signup.password")}
              type="password"
              before={<FontAwesomeIcon icon={faLock} />}
              error={errors.password?.message}
              {...register("password")}
            />
            <InputPassword
              placeholder={t("page.signup.confirm_password")}
              type="password"
              before={<FontAwesomeIcon icon={faLock} />}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            {isSignupFeatureActive && (
              <Input
                placeholder={t("page.signup.code")}
                type="text"
                before={<FontAwesomeIcon icon={faKey} />}
                error={errors.code?.message}
                {...register("code")}
              />
            )}

            <Row mb="0.4rem">
              <Checkbox {...register("terms")} error={errors.terms?.message}>
                {t("page.signup.agree_to")}{" "}
                <Anchor target="_blank" href="/tos">
                  {t("page.signup.terms_of_service")}
                </Anchor>
              </Checkbox>
            </Row>

            <Row justifyContent="space-between">
              <Column>
                <Row justifyContent="space-between" mb="0.4rem">
                  <Anchor href="/login">
                    {t("page.signup.already_have_account")}
                  </Anchor>
                </Row>
                <Row mb="0.4rem">
                  <Anchor onClick={handleOpenForgotPasswordModal}>
                    {t("page.signup.forgot_your_password")}
                  </Anchor>
                </Row>
              </Column>

              <Button
                type="submit"
                after={<FontAwesomeIcon icon={faAngleRight} />}
                isLoading={isLoading}
              >
                {t("page.signup.next")}
              </Button>
            </Row>
          </form>
        </StyledSignup>
      </Section>
    </Container>
  );
};
