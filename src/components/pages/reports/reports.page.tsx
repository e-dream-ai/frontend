import Container from "@/components/shared/container/container";
import { Row } from "@/components/shared";
import { Section } from "@/components/shared/section/section";
import { useTranslation } from "react-i18next";
import ReportsList from "@/components/shared/reports-list/reports-list";

const SECTION_ID = "reports";

export const ReportsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <Row justifyContent="space-between" mb="4">
        <h2>{t("page.reports.title")}</h2>
        <Row>
        </Row>
      </Row>
      <Section id={SECTION_ID}>
        <ReportsList />
      </Section>
    </Container>
  );
};

export default ReportsPage;
