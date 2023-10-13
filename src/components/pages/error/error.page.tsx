import { Anchor } from "components/shared";
import Container from "components/shared/container/container";
import Text from "components/shared/text/text";
import { ROUTES } from "constants/routes.constants";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const ErrorPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleGoHome = () => navigate(ROUTES.ROOT);
  return (
    <Container>
      <h2>{t("page.error.404_not_found")}</h2>
      <>
        <Text>{t("page.error.page_not_found")}, </Text>
        <Anchor onClick={handleGoHome}>{t("page.error.go_home")}</Anchor>
      </>
    </Container>
  );
};

export default ErrorPage;
