import {
  ForgotPasswordModal,
  LoginModal,
  SignupModal,
} from "@/components/modals";
import { CreateModal } from "@/components/modals/create/create.modal";
import { ModalProvider as StateModalProvider } from "@/context/modal.context";
import useModal from "@/hooks/useModal";
import styled from "styled-components";
import { ModalProvider as StyledReactModalProvider } from "styled-react-modal";

export const styledBackgroundComponent = styled.div`
  display: flex;
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  z-index: 99;
  align-items: center;
  -webkit-box-align: center;
  -webkit-box-pack: center;
  justify-content: center;
  background-color: rgba(58, 58, 58, 0.8);
`;

export const ModalProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => (
  <StateModalProvider>
    <StyledModalProviderWrapper>{children}</StyledModalProviderWrapper>
  </StateModalProvider>
);

export const StyledModalProviderWrapper: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { state } = useModal();
  return (
    <StyledReactModalProvider backgroundComponent={styledBackgroundComponent}>
      <>
        {state.loginModal && (
          <LoginModal
            key={Number(state.loginModal)}
            isOpen={state.loginModal}
          />
        )}
        {state.signupModal && <SignupModal isOpen={state.signupModal} />}
        {state.forgotPasswordModal && (
          <ForgotPasswordModal isOpen={state.forgotPasswordModal} />
        )}
        {state.createModal && <CreateModal isOpen={state.createModal} />}
      </>
      {children}
    </StyledReactModalProvider>
  );
};

export default ModalProvider;
