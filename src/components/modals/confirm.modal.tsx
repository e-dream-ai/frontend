import { Button, Modal, Row } from "components/shared";
import { useTranslation } from "react-i18next";
import { VoidFunctionType } from "types/function.types";
import { ModalComponent } from "types/modal.types";
import { VoidFunction } from "utils/function.util";

type ConfirmModalTypes = {
  isOpen?: boolean;
  isConfirming?: boolean;
  title?: string;
  onConfirm?: VoidFunctionType;
  confirmText?: string;
  onCancel?: VoidFunctionType;
  cancelText?: string;
  text?: React.ReactNode;
};

export const ConfirmModal: React.FC<ModalComponent<ConfirmModalTypes>> = ({
  isOpen = false,
  isConfirming = false,
  title,
  onConfirm = VoidFunction,
  confirmText,
  onCancel = VoidFunction,
  cancelText,
  text,
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
        <Button
          disabled={isConfirming}
          onClick={isConfirming ? VoidFunction : onCancel}
        >
          {t("modal.confirm.cancel")}
        </Button>
        <Button
          isLoading={isConfirming}
          marginLeft
          onClick={isConfirming ? VoidFunction : onConfirm}
        >
          {t("modal.confirm.confirm")}
        </Button>
      </Row>
    </Modal>
  );
};
