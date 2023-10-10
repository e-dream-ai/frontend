import { useCreateDream } from "api/dream/useCreateDream";
import { Button, Modal } from "components/shared";
import Text from "components/shared/text/text";
import { ModalsKeys } from "constants/modal.constants";
import { ROUTES } from "constants/routes.constants";
import useModal from "hooks/useModal";
import { useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import router from "routes/router";
import { ModalComponent } from "types/modal.types";
import { UploadRow, Video } from "./upload-dream.styled";

const fileTypes = ["MP4"];

export const UploadDreamModal: React.FC<
  ModalComponent<{
    isOpen?: boolean;
  }>
> = ({ isOpen = false }) => {
  const { t } = useTranslation();
  const { hideModal } = useModal();
  const [file, setFile] = useState<Blob | null>(null);
  const [videoLocalUrl, setVideoLocalUrl] = useState<string | null>(null);
  const videoRef = useRef(null);

  const { mutate, isLoading } = useCreateDream();

  const handleHideModal = () => {
    if (isLoading) {
      return;
    }
    setFile(null);
    setVideoLocalUrl(null);
    hideModal(ModalsKeys.UPLOAD_DREAM_MODAL);
  };

  const handleChange = (file: Blob) => {
    console.log(file);
    setFile(file);
    setVideoLocalUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    mutate(
      { video: file! },
      {
        onSuccess: (data) => {
          const dream = data?.data?.dream;
          if (data.success) {
            toast.success(t("modal.upload_dream.dream_successfully_created"));
            handleHideModal();
            router.navigate(`${ROUTES.VIEW_DREAM}/${dream?.uuid}`);
          } else {
            toast.error(
              `${t("modal.upload_dream.error_creating_dream")} ${data.message}`,
            );
          }
        },
        onError: () => {
          toast.error(t("modal.upload_dream.error_creating_dream"));
        },
      },
    );
  };

  return (
    <Modal
      title={t("modal.upload_dream.title")}
      isOpen={isOpen}
      hideModal={handleHideModal}
    >
      {file ? (
        <>
          <Text>{t("modal.upload_dream.dream_preview")}</Text>
          <Video ref={videoRef} id="dream" controls src={videoLocalUrl || ""} />
          <UploadRow justifyContent="flex-end">
            <Button
              after={<i className="fa fa-upload" />}
              onClick={handleUpload}
              isLoading={isLoading}
            >
              {t("modal.upload_dream.upload")}
            </Button>
          </UploadRow>
        </>
      ) : (
        <>
          <Text>{t("modal.upload_dream.dream_instructions")}</Text>
          <FileUploader
            handleChange={handleChange}
            name="file"
            types={fileTypes}
          />
        </>
      )}
    </Modal>
  );
};
