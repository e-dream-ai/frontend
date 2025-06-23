import { Button, Modal, Row } from "@/components/shared";
import { useTranslation } from "react-i18next";
import { ConfirmModalTypes, ModalComponent } from "@/types/modal.types";
import { VoidFunction } from "@/utils/function.util";

export const ConfirmModal: React.FC<ModalComponent<ConfirmModalTypes>> = ({
  isOpen = false,
  isConfirming = false,
  title,
  onConfirm = VoidFunction,
  confirmText,
  confirmButtonType = "primary",
  onCancel = VoidFunction,
  text,
  cancelText,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      size="sm"
      title={title ?? t("modal.confirm.title")}
      isOpen={isOpen}
      hideModal={isConfirming ? VoidFunction : onCancel}
    >
      <Row>{text}</Row>

      <Row justifyContent="flex-end">
        {cancelText !== "" && (
          <Button
            disabled={isConfirming}
            onClick={isConfirming ? VoidFunction : onCancel}
          >
            {cancelText ?? t("modal.confirm.cancel")}
          </Button>
        )}
        <Button
          buttonType={confirmButtonType}
          isLoading={isConfirming}
          ml={cancelText !== "" ? "1rem" : "0"}
          onClick={isConfirming ? VoidFunction : onConfirm}
        >
          {confirmText ?? t("modal.confirm.confirm")}
        </Button>
      </Row>
    </Modal>
  );
};
