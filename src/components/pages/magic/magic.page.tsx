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
import {
  faLock,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "@/constants/routes.constants";
import { StyledMagic } from "./magic.styled";
import useMagic from "@/api/auth/useMagic";
import MagicSchema, { MagicFormValues } from "@/schemas/magic.schema";
import { useLocation, Navigate } from "react-router-dom";
import { useTheme } from "styled-components";

const SECTION_ID = "magic";

type LocationState = {
  email?: string;
};

export const MagicPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const location = useLocation();
  const theme = useTheme();

  const state = location.state as LocationState;
  const email = state?.email;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MagicFormValues>({
    resolver: yupResolver(MagicSchema),
    values: {
      email: email ?? "",
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
              })}`,
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
            <h2>{t("page.magic.title")}</h2>
          </Row>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Text mb={3} fontSize="1rem" color={theme.textSecondaryColor}>
              {email}
            </Text>
            <Input
              placeholder={t("page.magic.code")}
              before={<FontAwesomeIcon icon={faLock} />}
              error={errors.code?.message}
              {...register("code")}
            />

            <Row justifyContent="space-between" mb="0.4rem">
              <Button
                type="submit"
                after={<FontAwesomeIcon icon={faAngleRight} />}
                isLoading={isLoading}
              >
                {t("page.magic.submit")}
              </Button>
            </Row>
          </form>
        </StyledMagic>
      </Section>
    </Container>
  );
};
