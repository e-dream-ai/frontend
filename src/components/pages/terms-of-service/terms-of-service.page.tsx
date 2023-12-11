import { Row } from "components/shared";
import Container from "components/shared/container/container";
import { LoremIpsum8P } from "components/shared/lorem-ipsum/lorem-ipsum";
import { Section } from "components/shared/section/section";
import Text from "components/shared/text/text";
import { useTranslation } from "react-i18next";

const SECTION_ID = "terms-of-service";

export const TermsOfServicePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <h2>{t("page.terms_of_service.title")}</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator />
        <Text>
          <LoremIpsum8P />
        </Text>
      </Section>
    </Container>
  );
};

export default TermsOfServicePage;
