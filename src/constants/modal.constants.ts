export enum ModalsKeys {
  LOGIN_MODAL = "loginModal",
  SIGNUP_MODAL = "signupModal",
  FORGOT_PASSWORD_MODAL = "forgotPasswordModal",
}

export enum ModalActionKind {
  SHOW = "show",
  HIDE = "hide",
}

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
