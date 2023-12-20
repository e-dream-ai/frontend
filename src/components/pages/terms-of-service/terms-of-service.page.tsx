import { Row } from "components/shared";
import Container from "components/shared/container/container";
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
          <ol>
            <li>
              <b>Acceptance of Terms of Service</b>
              <ol>
                <li>
                  These Terms of Service, which include our End User License
                  Agreement (&ldquo;EULA&rdquo;) govern your use of the e-dream
                  service, hereafter, &ldquo;The Service&rdquo;.
                </li>
                <li>more details</li>
              </ol>
            </li>
            <li>
              <b>Changes to Terms of Service.</b> The company may, from time to
              time, change these Terms of Service. We will post announcements
              through social media and on
              <a href="https://e-dream.ai/">e-dream.ai</a> when we do so.
            </li>
          </ol>
        </Text>
      </Section>
    </Container>
  );
};

export default TermsOfServicePage;
