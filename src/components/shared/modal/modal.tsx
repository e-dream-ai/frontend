import { Anchor } from "../anchor/anchor";
import {
  ModalBody,
  ModalHeader,
  ModalTitle,
  StyledReactModal,
} from "./modal.styled";

type ModalProps = {
  isOpen?: boolean;
  title: string;
  children?: React.ReactNode;
  showModal?: () => void;
  hideModal?: () => void;
};

const ModalClose: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <Anchor onClick={onClick}>
      <i className="fa fa-close" />
    </Anchor>
  );
};

export const Modal: React.FC<ModalProps> = ({
  isOpen = false,
  title,
  children,
  showModal,
  hideModal,
}) => {
  return (
    <StyledReactModal isOpen={isOpen} onBackgroundClick={hideModal}>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <ModalClose onClick={hideModal} />
      </ModalHeader>
      <ModalBody>{children}</ModalBody>
    </StyledReactModal>
  );
};

export default Modal;
