import { yupResolver } from "@hookform/resolvers/yup";
import router from "@/routes/router";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { Button, Input, Row, Text } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "@/constants/routes.constants";
import { StyledMagic } from "./magic.styled";
import useMagic from "@/api/auth/useMagic";
import MagicSchema, { MagicFormValues } from "@/schemas/magic.schema";
import { useLocation, Navigate } from "react-router-dom";
import { useTheme } from "styled-components";

const SECTION_ID = "magic";

type LocationState = {
  email?: string;
  isEmailVerification?: boolean;
};

export const MagicPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const location = useLocation();
  const theme = useTheme();

  const state = location.state as LocationState;
  const email = state.email!;
  const isEmailVerification = state.isEmailVerification;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MagicFormValues>({
    resolver: yupResolver(MagicSchema),
    values: {
      email: email,
      code: "",
    },
  });

  const { mutate, isLoading } = useMagic();

  const onSubmit = (data: MagicFormValues) => {
    mutate(
      { email: data.email, code: data.code },
      {
        onSuccess: (data) => {
          if (data.success) {
            const user = data.data!.user!;
            login(user);
            toast.success(
              `${t("page.magic.welcome_user", {
                username: user.name ?? user.email,
              })}.`,
            );
            reset();
            router.navigate(ROUTES.PLAYLISTS);
          } else {
            toast.error(
              `${t("page.magic.error_verifying_code")} ${data.message}`,
            );
          }
        },
        onError: () => {
          toast.error(t("page.magic.error_verifying_code"));
        },
      },
    );
  };

  if (!email) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return (
    <Container>
      <Section id={SECTION_ID}>
        <StyledMagic>
          <Row alignContent="flex-start">
            <h2>
              {isEmailVerification
                ? t("page.magic.title_verification")
                : t("page.magic.title_login")}
            </h2>
          </Row>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Text mb={3} fontSize="1rem" color={theme.textSecondaryColor}>
              {t("page.magic.instructions")}
            </Text>

            <Input
              disabled
              value={email}
              placeholder={t("page.magic.email")}
              before={<FontAwesomeIcon icon={faEnvelope} />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={t("page.magic.code")}
              before={<FontAwesomeIcon icon={faLock} />}
              error={errors.code?.message}
              {...register("code")}
            />

            <Row flex="auto">
              <Button
                type="submit"
                isLoading={isLoading}
                style={{ width: "-webkit-fill-available" }}
              >
                {isEmailVerification
                  ? t("page.magic.verify_email")
                  : t("page.magic.login")}
              </Button>
            </Row>
          </form>
        </StyledMagic>
      </Section>
    </Container>
  );
};
