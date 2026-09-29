import type { StudioImage } from "@/types/studio.types";
import { PresignedImage } from "@/components/shared/presigned-image";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import { useImageOrigin } from "../hooks/useImageOrigin";
import {
  Overlay,
  Header,
  Title,
  CloseBtn,
  Footer,
  FooterButtons,
  CancelBtn,
  AddBtn,
} from "./select-modal.styled";
import {
  ActionDialogPanel,
  ActionDialogBody,
  ActionPromptText,
  ActionMeta,
  ImageDialogThumb,
  DeleteBtn,
} from "./action-dialog.styled";
import { DIALOG_THUMB } from "../utils/sized-image";

interface Props {
  image: StudioImage;
  /** Clips it has in the matrix. */
  clipCount: number;
  onClose: () => void;
  /** Check or uncheck every cell in its row, then close. */
  onCheckRow: () => void;
  onUncheckRow: () => void;
  /** Close, and open the generate dialog loaded with this frame's prompt. */
  onGenerateMore: () => void;
  /** Remove the frame, discarding its clips; asks first if it has any. */
  onDelete: () => void;
}

/**
 * Opened from a matrix row heading, as the action dialog is from a column:
 * the frame, the prompt that made it (or that it was uploaded), and a way to
 * generate more like it without leaving the matrix.
 */
export const ImageDialog: React.FC<Props> = ({
  image,
  clipCount,
  onClose,
  onCheckRow,
  onUncheckRow,
  onGenerateMore,
  onDelete,
}) => {
  const overlayRef = useLightboxA11y<HTMLDivElement>(onClose);
  const { loading, generated, settings, remix } = useImageOrigin(image.uuid);

  const generateMore = () => {
    remix();
    onGenerateMore();
  };

  const meta = [
    ...settings,
    clipCount === 0
      ? "No clips in the matrix yet."
      : `${clipCount} ${clipCount === 1 ? "clip" : "clips"} in the matrix.`,
  ];

  return (
    <Overlay ref={overlayRef} tabIndex={-1} onClick={onClose}>
      <ActionDialogPanel
        role="dialog"
        aria-modal="true"
        aria-label={image.name}
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          <Title>{image.name}</Title>
          <CloseBtn onClick={onClose} aria-label="Close">
            &times;
          </CloseBtn>
        </Header>
        <ActionDialogBody>
          <ImageDialogThumb
            as={PresignedImage}
            dreamUuid={image.uuid}
            resizeOptions={DIALOG_THUMB}
            alt=""
          />
          {loading ? (
            <ActionMeta>Loading…</ActionMeta>
          ) : generated ? (
            <>
              <ActionPromptText>{generated.prompt}</ActionPromptText>
              {generated.negativePrompt && (
                <ActionMeta>Negative: {generated.negativePrompt}</ActionMeta>
              )}
            </>
          ) : (
            <ActionPromptText>Uploaded image, no prompt.</ActionPromptText>
          )}
          <ActionMeta>{meta.join(" · ")}</ActionMeta>
        </ActionDialogBody>
        <Footer>
          <FooterButtons>
            <CancelBtn onClick={onCheckRow}>Check all</CancelBtn>
            <CancelBtn onClick={onUncheckRow}>Uncheck all</CancelBtn>
            <DeleteBtn onClick={onDelete}>Remove</DeleteBtn>
          </FooterButtons>
          <FooterButtons>
            <CancelBtn onClick={onClose}>Close</CancelBtn>
            {generated && <AddBtn onClick={generateMore}>Remix</AddBtn>}
          </FooterButtons>
        </Footer>
      </ActionDialogPanel>
    </Overlay>
  );
};
