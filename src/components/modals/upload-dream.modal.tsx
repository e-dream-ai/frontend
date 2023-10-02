import { Modal } from "components/shared";
import { ModalsKeys } from "constants/modal.constants";
import { ROUTES } from "constants/routes.constants";
import useModal from "hooks/useModal";
import { FileUploader } from "react-drag-drop-files";
import { router } from "routes/router";
import { ModalComponent } from "types/modal.types";

const fileTypes = ["JPG", "JPEG", "MP4"];

export const UploadDreamModal: React.FC<
  ModalComponent<{
    isOpen?: boolean;
  }>
> = ({ isOpen = false }) => {
  const { hideModal } = useModal();
  const handleHideModal = () => hideModal(ModalsKeys.UPLOAD_DREAM_MODAL);
  const handleChange = () => {
    handleHideModal();
    router.navigate(ROUTES.VIEW_DREAM);
  };

  return (
    <Modal title="Upload dream" isOpen={isOpen} hideModal={handleHideModal}>
      <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
    </Modal>
  );
};
