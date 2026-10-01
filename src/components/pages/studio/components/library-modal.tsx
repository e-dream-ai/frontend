import React from "react";
import { createPortal } from "react-dom";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import {
  Overlay,
  Header,
  Title,
  CloseBtn,
  Footer,
  CountLabel,
  FooterButtons,
  CancelBtn,
} from "./select-modal.styled";
import { LibraryPanel } from "./prompt-library.styled";

interface Props {
  title: string;
  status: React.ReactNode;
  onClose: () => void;
  preview?: React.ReactNode;
  children: React.ReactNode;
}

export const LibraryModal: React.FC<Props> = ({
  title,
  status,
  onClose,
  preview,
  children,
}) => {
  const overlayRef = useLightboxA11y<HTMLDivElement>(onClose);

  return createPortal(
    <>
      <Overlay
        ref={overlayRef}
        tabIndex={-1}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <LibraryPanel onClick={(e) => e.stopPropagation()}>
          <Header>
            <Title>{title}</Title>
            <CloseBtn onClick={onClose} aria-label="Close">
              &times;
            </CloseBtn>
          </Header>
          {children}
          <Footer>
            <CountLabel>{status}</CountLabel>
            <FooterButtons>
              <CancelBtn onClick={onClose}>Close</CancelBtn>
            </FooterButtons>
          </Footer>
        </LibraryPanel>
      </Overlay>
      {preview}
    </>,
    document.body,
  );
};
