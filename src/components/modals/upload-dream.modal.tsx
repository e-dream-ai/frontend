import { Modal } from "components/shared";
import { ModalsKeys } from "constants/modal.constants";
import { ROUTES } from "constants/routes.constants";
import useModal from "hooks/useModal";
import { FileUploader } from "react-drag-drop-files";
import { useTranslation } from "react-i18next";
import { router } from "routes/router";
import { ModalComponent } from "types/modal.types";

const fileTypes = ["MP4"];

export const UploadDreamModal: React.FC<
  ModalComponent<{
    isOpen?: boolean;
  }>
> = ({ isOpen = false }) => {
  const { t } = useTranslation();
  const { hideModal } = useModal();
  const handleHideModal = () => hideModal(ModalsKeys.UPLOAD_DREAM_MODAL);
  const handleChange = () => {
    handleHideModal();
    router.navigate(ROUTES.VIEW_DREAM);
  };

  return (
    <Modal
      title={t("modal.upload_dream.title")}
      isOpen={isOpen}
      hideModal={handleHideModal}
    >
      <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
    </Modal>
  );
};
