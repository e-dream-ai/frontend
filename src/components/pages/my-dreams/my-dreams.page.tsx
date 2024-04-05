import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import UserDreams from "@/components/shared/user-dreams/user-dreams";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

const SECTION_ID = "my-dreams";

export const MyDreamsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <Container>
      <h2>{t("page.my_dreams.title")}</h2>
      <Section id={SECTION_ID}>
        <UserDreams userId={user?.id} grid />
      </Section>
    </Container>
  );
};

export default MyDreamsPage;
