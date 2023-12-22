import { Anchor } from "@/components/shared";
import { Sizes } from "@/types/sizes.types";
import {
  ModalBody,
  ModalCloseIcon,
  ModalHeader,
  ModalTitle,
  StyledReactModal,
} from "./modal.styled";

type ModalProps = {
  isOpen?: boolean;
  title: string;
  size?: Sizes;
  children?: React.ReactNode;
  showModal?: () => void;
  hideModal?: () => void;
};

const ModalClose: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <Anchor onClick={onClick}>
      <ModalCloseIcon className="fa fa-close" />
    </Anchor>
  );
};

export const Modal: React.FC<ModalProps> = ({
  isOpen = false,
  title,
  size = "sm",
  children,
  hideModal,
}) => {
  return (
    <StyledReactModal size={size} isOpen={isOpen} onBackgroundClick={hideModal}>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <ModalClose onClick={hideModal} />
      </ModalHeader>
      <ModalBody>{children}</ModalBody>
    </StyledReactModal>
  );
};

export default Modal;
