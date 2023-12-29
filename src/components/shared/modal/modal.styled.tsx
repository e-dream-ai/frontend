import styled, { css } from "styled-components";
import Modal from "styled-react-modal";
import { Sizes } from "@/types/sizes.types";

const ModalSizes = {
  sm: css`
    min-width: 320px;
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
  background-color: rgba(0, 0, 0, 0.9);
`;

export const ModalHeader = styled.div`
  width: auto;
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.colorBackgroundModalHeader};
  border: 0;
  color: ${(props) => props.theme.textPrimaryColor};
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
  color: ${(props) => props.theme.textPrimaryColor};
  margin: 0;
  line-height: 1.5rem;
`;

export const ModalCloseIcon = styled.span`
  font-size: 1.5rem;
`;
