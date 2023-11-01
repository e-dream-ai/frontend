import styled, { css } from "styled-components";
import Modal from "styled-react-modal";
import { Sizes } from "types/sizes.types";

const ModalSizes = {
  sm: css`
    min-width: 320px;
    min-height: 320px;
  `,
  md: css`
    min-width: 480px;
    min-height: 320px;
  `,
  lg: css`
    min-width: 720px;
    min-height: 320px;
  `,
};

export const StyledReactModal = styled(Modal.styled``)<{ size?: Sizes }>`
  ${(props) => ModalSizes[props.size || "sm"]}
  width: auto;
  height: auto;
  display: flex;
  flex-flow: column;
  background-color: rgba(0, 0, 0, 0.8);

  /*Devices smaller than 767px*/
  @media (max-width: 767px) {
    /* min-width: 320px; */
  }

  /*Devices between 768px and 1024px*/
  @media (min-width: 768px) and (max-width: 1024px) {
    /* min-width: 380px; */
  }

  /*Devices larger than 1024px*/
  @media (min-width: 1024px) {
    /* min-width: 420px; */
  }
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
