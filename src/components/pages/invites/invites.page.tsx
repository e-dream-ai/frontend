import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { useTranslation } from "react-i18next";
import InvitesList from "@/components/shared/invites-list/invites-list";
import CreateInviteForms from "@/components/shared/create-invite-forms/create-invite-forms";
import { Row } from "@/components/shared";

const CREATE_INVITES_SECTION_ID = "create_invites";
const SECTION_ID = "invites";

export const InvitesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <h2>{t("page.invites.create_invites")}</h2>
      <Section id={CREATE_INVITES_SECTION_ID}>
        <CreateInviteForms />
      </Section>
      <Row />
      <h2>{t("page.invites.title")}</h2>
      <Section id={SECTION_ID}>
        <InvitesList />
      </Section>
    </Container>
  );
};

export default InvitesPage;
