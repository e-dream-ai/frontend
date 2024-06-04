import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { useTranslation } from "react-i18next";
import InvitesList from "@/components/shared/invites-list/invites-list";
import { Button, Row } from "@/components/shared";
import useModal from "@/hooks/useModal";
import { ModalsKeys } from "@/constants/modal.constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const SECTION_ID = "invites";

export const InvitesPage: React.FC = () => {
  const { t } = useTranslation();

  const { showModal } = useModal();

  const handleOpenCreateInviteModal = () => {
    showModal(ModalsKeys.CREATE_INVITE_MODAL);
  };

  return (
    <Container>
      <Row justifyContent="space-between" mb="4">
        <h2>{t("page.invites.title")}</h2>
        <Button
          onClick={handleOpenCreateInviteModal}
          before={<FontAwesomeIcon icon={faPlus} />}
          size="sm"
        >
          {t("page.invites.create")}
        </Button>
      </Row>
      <Section id={SECTION_ID}>
        <InvitesList />
      </Section>
    </Container>
  );
};

export default InvitesPage;
