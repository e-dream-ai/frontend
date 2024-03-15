export enum ModalsKeys {
  FORGOT_PASSWORD_MODAL = "forgotPasswordModal",
}

export enum ModalActionKind {
  SHOW = "show",
  HIDE = "hide",
}

// Part file size 200 MB
export const MULTIPART_FILE_PART_SIZE = 1024 * 1024 * 200;

export type ModalContextType = {
  state: ModalState;
  showModal: (modal: ModalsKeys) => void;
  hideModal: (modal: ModalsKeys) => void;
};

export type ModalState = Record<ModalsKeys, boolean>;

export type ModalAction = {
  type: ModalActionKind;
  payload?: object;
  target: ModalsKeys;
};
