import styled from "styled-components";
import ReactModal from "styled-react-modal";

export const StyledReactModal = ReactModal.styled`
  width: auto;
  height: auto;
  display: flex;
  flex-flow: column;
  background-color: rgba(0, 0, 0, 0.8);
`;

export const ModalHeader = styled.div`
  width: auto;
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.background3};
  border: 0;
  color: ${(props) => props.theme.text1};
  padding: 0.625rem 1.875rem;
`;

export const ModalBody = styled.div`
  width: auto;
  display: flex;
  flex-flow: column;
  padding: 1rem 1.875rem;

  form {
    width: auto;
    display: flex;
    flex-flow: column;
  }
`;

export const ModalTitle = styled.h2`
  font-size: 1rem;
  text-transform: uppercase;
  color: ${(props) => props.theme.text1};
  margin: 0;
  line-height: 1.5rem;
`;

export const ModalCloseIcon = styled.i`
  font-size: 1.5rem;
`;
