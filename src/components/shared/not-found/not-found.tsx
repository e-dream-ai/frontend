import { useTranslation } from "react-i18next";
import Container from "../container/container";
import Row, { Column } from "../row/row";
import { Section } from "../section/section";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
import Text from "../text/text";
import Anchor from "../anchor/anchor";

const SectionID = "not-found";

export const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleGoHome = () => navigate(ROUTES.ROOT);

  return (
    <Section id={SectionID}>
      <Container>
        <Row
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          pb={[2, 2, "1rem"]}
          separator
        >
          <Column flex={["1 1 200px", "1", "1"]}>
            <h2 style={{ margin: 0 }}>{t("components.not_found.title")}</h2>
          </Column>
        </Row>

        <Row flex="1">
          <Text>
            {t("page.not_found.message")},{" "}
            <Anchor onClick={handleGoHome}>
              {t("components.not_found.go_home")}
            </Anchor>
            .
          </Text>
        </Row>
      </Container>
    </Section>
  );
};
