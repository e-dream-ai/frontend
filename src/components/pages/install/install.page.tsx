import { Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import Text from "@/components/shared/text/text";
import { useTranslation } from "react-i18next";

const SECTION_ID = "install";

export const InstallPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <h2>{t("page.install.title")}</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator />
        <Text>
          <p>
	    Download and double click a DMG with a native Mac
	    application. Run installer or drag to applications.
	  </p>
	  <p>
	    Requirements: Mac OS version X or better, x86 or Apple
	    Silicon.
	  </p>
	  <p>
	    Open the settings to log in. Press F1 key for help and F2
	    key for status.
	  </p>
        </Text>
      </Section>
    </Container>
  );
};

export default InstallPage;
