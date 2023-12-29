import { Anchor } from "@/components/shared";
import { Sizes } from "@/types/sizes.types";
import {
  ModalBody,
  ModalCloseIcon,
  ModalHeader,
  ModalTitle,
  StyledReactModal,
} from "./modal.styled";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
      <ModalCloseIcon>
        <FontAwesomeIcon icon={faClose} />
      </ModalCloseIcon>
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
