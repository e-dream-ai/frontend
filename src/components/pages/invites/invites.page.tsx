import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { useTranslation } from "react-i18next";
import InvitesList from "@/components/shared/invites-list/invites-list";
import { Button, Row } from "@/components/shared";
import useModal from "@/hooks/useModal";
import { ModalsKeys } from "@/constants/modal.constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faToggleOff,
  faToggleOn,
} from "@fortawesome/free-solid-svg-icons";
import useSignupFeature from "@/api/feature/hook/useSignupFeature";
import { useUpdateFeature } from "@/api/feature/mutation/useUpdateFeature";
import { FEATURES } from "@/constants/feature.constants";
import { toast } from "react-toastify";

const SECTION_ID = "invites";

export const InvitesPage: React.FC = () => {
  const { t } = useTranslation();

  const { showModal } = useModal();

  const handleOpenCreateInviteModal = () => {
    showModal(ModalsKeys.CREATE_INVITE_MODAL);
  };

  const isSignupFeatureActive = useSignupFeature();

  const { mutateAsync } = useUpdateFeature();

  const handleSwitchFeature = async () => {
    try {
      const data = await mutateAsync({
        name: FEATURES.SIGNUP_WITH_CODE,
        isActive: !isSignupFeatureActive,
      });

      if (data.success) {
        toast.success(
          `Signup feature ${
            isSignupFeatureActive ? "deactivated" : "activated"
          } successfully.`,
        );
      } else {
        toast.error("Error switching feature.");
      }
    } catch (error) {
      toast.error("Error switching feature.");
    }
  };

  return (
    <Container>
      <Row justifyContent="space-between" mb="4">
        <h2>{t("page.invites.title")}</h2>
        <Row>
          <Button
            onClick={handleOpenCreateInviteModal}
            before={<FontAwesomeIcon icon={faPlus} />}
            size="sm"
            mr="2"
          >
            {t("page.invites.create")}
          </Button>

          <Button
            onClick={handleSwitchFeature}
            before={
              <FontAwesomeIcon
                icon={isSignupFeatureActive ? faToggleOn : faToggleOff}
              />
            }
            size="sm"
            buttonType={isSignupFeatureActive ? "primary" : "tertiary"}
          ></Button>
        </Row>
      </Row>
      <Section id={SECTION_ID}>
        <InvitesList />
      </Section>
    </Container>
  );
};

export default InvitesPage;
