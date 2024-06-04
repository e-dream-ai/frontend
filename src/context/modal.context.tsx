import {
  ModalAction,
  ModalActionKind,
  ModalContextType,
  ModalState,
  ModalsKeys,
} from "@/constants/modal.constants";
import React, { createContext, useCallback, useMemo, useReducer } from "react";

const initialState: ModalState = {
  forgotPasswordModal: false,
  createInviteModal: false,
};

export const ModalContext = createContext<ModalContextType>({
  state: initialState,
} as ModalContextType);

const reducer = (state: ModalState, action: ModalAction): ModalState => {
  if (action.type === ModalActionKind.SHOW) {
    return { ...state, [action.target]: true };
  }

  if (action.type === ModalActionKind.HIDE) {
    return { ...state, [action.target]: false };
  }

  return state;
};

export const ModalProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    (initialState) => initialState,
  );

  const showModal = useCallback((modal: ModalsKeys) => {
    dispatch({ type: ModalActionKind.SHOW, target: modal });
  }, []);

  const hideModal = useCallback((modal: ModalsKeys) => {
    dispatch({ type: ModalActionKind.HIDE, target: modal });
  }, []);

  const memoedValue = useMemo(
    () => ({
      state,
      showModal,
      hideModal,
    }),
    [state, showModal, hideModal],
  );

  return (
    <ModalContext.Provider value={memoedValue}>
      {children}
    </ModalContext.Provider>
  );
};

export default ModalContext;
