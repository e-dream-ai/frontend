import { VoidFunctionType } from "./function.types";
import { Types } from "./style-types.types";

export type ModalComponent<T> = T;

export type ConfirmModalTypes = {
  isOpen?: boolean;
  isConfirming?: boolean;
  title?: string;
  onConfirm?: VoidFunctionType;
  confirmText?: string;
  confirmButtonType?: Types;
  confirmDisabled?: boolean;
  onCancel?: VoidFunctionType;
  cancelText?: string;
  text?: React.ReactNode;
};
