import { Modal } from "@/components/shared";
import { ModalsKeys } from "@/constants/modal.constants";
import useModal from "@/hooks/useModal";
import { useTranslation } from "react-i18next";
import { ModalComponent } from "@/types/modal.types";
import { TabList } from "@/components/shared/tabs/tabs";
import { Tab, TabPanel, Tabs } from "react-tabs";
import { useState } from "react";

import {
  InviteByEmailForm,
  InviteCustomCodeForm,
} from "../shared/create-invite-forms/create-invite-forms";

enum CREATE_INVITE {
  EMAIL = 0,
  CUSTOM = 1,
}

export const CreateInviteModal: React.FC<
  ModalComponent<{
    isOpen?: boolean;
  }>
> = ({ isOpen = false }) => {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState<CREATE_INVITE>(CREATE_INVITE.EMAIL);
  const { hideModal } = useModal();
  const handleHideModal = () => hideModal(ModalsKeys.CREATE_INVITE_MODAL);

  return (
    <Modal
      title={t("modal.create_invite.title")}
      isOpen={isOpen}
      hideModal={handleHideModal}
    >
      <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
        <TabList>
          <Tab tabIndex={`${CREATE_INVITE.EMAIL}`}>
            {t("modal.create_invite.invites_sent_email_tab_title")}
          </Tab>
          <Tab tabIndex={`${CREATE_INVITE.CUSTOM}`}>
            {t("modal.create_invite.invites_custom_code_tab_title")}
          </Tab>
        </TabList>

        <TabPanel tabIndex={CREATE_INVITE.EMAIL}>
          <InviteByEmailForm onSucess={handleHideModal} />
        </TabPanel>

        <TabPanel tabIndex={CREATE_INVITE.CUSTOM}>
          <InviteCustomCodeForm onSucess={handleHideModal} />
        </TabPanel>
      </Tabs>
    </Modal>
  );
};
