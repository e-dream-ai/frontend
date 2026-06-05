import { yupResolver } from "@hookform/resolvers/yup";
import useSignup from "@/api/auth/useSignup";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import {
  Anchor,
  AnchorLink,
  AuthCard,
  AuthFooterLinks,
  Button,
  Checkbox,
  Input,
  Row,
} from "@/components/shared";
// import { ModalsKeys } from "@/constants/modal.constants";
// import useModal from "@/hooks/useModal";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { SignupFormValues, getSignupSchema } from "@/schemas/signup.schema";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faKey,
  // faLock,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { ChevronRight } from "lucide-react";
// import InputPassword from "@/components/shared/input-password/input-password";
import { useSearchParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
import router from "@/routes/router";

const SECTION_ID = "signup";

export const SignupPage: React.FC = () => {
  const { t } = useTranslation();
  // const { showModal } = useModal();

  const [searchParams] = useSearchParams();
  const signupSchema = getSignupSchema();

  // Get specific search parameters
  const code = searchParams.get("invite") ?? "";
  const email = searchParams.get("email") ?? "";

  // const handleOpenForgotPasswordModal = () => {
  //   showModal(ModalsKeys.FORGOT_PASSWORD_MODAL);
  // };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<SignupFormValues>({
    resolver: yupResolver(signupSchema),
    values: {
      code,
      email: email,
      firstName: "",
      lastName: "",
      // password: "",
      // confirmPassword: "",
    },
  });

  const { mutate: mutateSignup, isLoading: isSignupLoading } = useSignup();

  const isLoading = isSignupLoading;

  const onSubmit = (data: SignupFormValues) => {
    const email = data.email;
    mutateSignup(
      {
        email,
        firstname: data.firstName,
        lastname: data.lastName,
        // password: data.password,
        code: data.code,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(t("page.signup.user_signup_successfully"));
            reset();
            router.navigate(ROUTES.MAGIC, {
              state: {
                email,
                isEmailVerification: true,
              },
            });
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

  return (
    <Container>
      <Section id={SECTION_ID}>
        <AuthCard
          title={t("page.signup.title")}
          subtitle={t("page.signup.subtitle")}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              placeholder={t("page.signup.email")}
              type="email"
              autoComplete="email"
              before={<FontAwesomeIcon icon={faEnvelope} />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              placeholder={t("page.signup.first_name")}
              type="text"
              before={<FontAwesomeIcon icon={faUser} />}
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <Input
              placeholder={t("page.signup.last_name")}
              type="lastName"
              before={<FontAwesomeIcon icon={faUser} />}
              error={errors.lastName?.message}
              {...register("lastName")}
            />
            {/* <InputPassword
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
            /> */}
            <Input
              placeholder={t("page.signup.code")}
              type="text"
              before={<FontAwesomeIcon icon={faKey} />}
              error={errors.code?.message}
              {...register("code")}
            />

            <Row mb="0.4rem">
              <Checkbox {...register("terms")} error={errors.terms?.message}>
                {t("page.signup.agree_to")}{" "}
                <Anchor target="_blank" href="/tos">
                  {t("page.signup.terms_of_service")}
                </Anchor>
              </Checkbox>
            </Row>

            <Row flex="auto">
              <Button
                type="submit"
                className={
                  isValid && isDirty ? "auth-cta is-ready" : "auth-cta"
                }
                after={<ChevronRight size={18} strokeWidth={2.25} />}
                isLoading={isLoading}
              >
                {t("page.signup.next")}
              </Button>
            </Row>

            <AuthFooterLinks>
              <AnchorLink to={ROUTES.SIGNIN}>
                {t("page.signup.already_have_account")}
              </AnchorLink>
            </AuthFooterLinks>
          </form>
        </AuthCard>
      </Section>
    </Container>
  );
};
