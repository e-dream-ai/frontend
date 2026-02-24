import styled from "styled-components";

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: ${(props) => props.theme.colorBackgroundPrimary || "#1a1a1a"};
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
`;

export const ModalTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${(props) => props.theme.textPrimaryColor};
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.textBodyColor};
  font-size: 1.25rem;
  cursor: pointer;
`;

export const ModalBody = styled.div`
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-top: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
`;

export const ImageSelectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
`;

export const ImageSelectCard = styled.div<{ $selected?: boolean }>`
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid
    ${(props) => (props.$selected ? props.theme.colorPrimary : "transparent")};
  cursor: pointer;
  aspect-ratio: 16 / 9;
  background: ${(props) => props.theme.colorBackgroundQuaternary};
`;
