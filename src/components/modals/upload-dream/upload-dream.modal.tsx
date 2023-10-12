import { useCreateDream } from "api/dream/mutation/useCreateDream";
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

type VideoState =
  | {
      fileBlob: Blob;
      url: string;
    }
  | undefined;

const fileTypes = ["MP4"];

export const UploadDreamModal: React.FC<
  ModalComponent<{
    isOpen?: boolean;
  }>
> = ({ isOpen = false }) => {
  const { t } = useTranslation();
  const { hideModal } = useModal();
  const [video, setVideo] = useState<VideoState>();
  const videoRef = useRef(null);

  const { mutate, isLoading } = useCreateDream();

  const handleHideModal = () => {
    if (isLoading) {
      return;
    }
    setVideo(undefined);
    hideModal(ModalsKeys.UPLOAD_DREAM_MODAL);
  };

  const handleChange = (file: Blob) => {
    setVideo({ fileBlob: file, url: URL.createObjectURL(file) });
  };

  const handleUpload = async () => {
    mutate(
      { video: video?.fileBlob },
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
      {video ? (
        <>
          <Text>{t("modal.upload_dream.dream_preview")}</Text>
          <Video ref={videoRef} id="dream" controls src={video?.url ?? ""} />
          <UploadRow justifyContent="flex-end">
            <Button
              after={<i className="fa fa-upload" />}
              onClick={handleUpload}
              isLoading={isLoading}
            >
              {isLoading
                ? t("modal.upload_dream.uploading")
                : t("modal.upload_dream.upload")}
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
