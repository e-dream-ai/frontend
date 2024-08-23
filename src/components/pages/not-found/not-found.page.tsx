import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Header from "@/components/shared/header/header";
import { Anchor, Footer, Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import Text from "@/components/shared/text/text";
import { ROUTES } from "@/constants/routes.constants";

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleGoHome = () => navigate(ROUTES.ROOT);
  return (
    <>
      <Header />
      <Container>
        <h2>{t("page.not_found.title")}</h2>
        <>
          <Text>
            {t("page.not_found.message")},{" "}
            <Anchor onClick={handleGoHome}>
              {t("page.not_found.go_home")}
            </Anchor>
            .
          </Text>
        </>
      </Container>
      <Row mb={["180px", "120px", "100px"]} />
      <Footer />
    </>
  );
};

export default NotFoundPage;
