import styled from "styled-components";
import ReactModal from "styled-react-modal";

export const StyledReactModal = ReactModal.styled`
  width: 420px;
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
  background-color: #252525;
  border: 0;
  color: #fff;
  padding: 10px 30px;
`;

export const ModalBody = styled.div`
  width: auto;
  display: flex;
  flex-flow: column;
  padding: 10px 30px;
`;

export const ModalTitle = styled.h2`
  font-size: 1rem;
  text-transform: uppercase;
  color: #fff;
  margin: 0;
`;
