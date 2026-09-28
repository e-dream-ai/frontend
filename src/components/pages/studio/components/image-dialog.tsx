import type { StudioImage } from "@/types/studio.types";
import { useStudioStore } from "@/stores/studio.store";
import { useDream } from "@/api/dream/query/useDream";
import { useModels } from "@/api/model/query/useModels";
import { PresignedImage } from "@/components/shared/presigned-image";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import { imageOriginFromDreamPrompt } from "../utils/image-prompt";
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
} from "./action-dialog.styled";

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
}) => {
  const overlayRef = useLightboxA11y<HTMLDivElement>(onClose);
  const { data, isLoading } = useDream(image.uuid);
  const dream = data?.data?.dream;
  const origin = dream ? imageOriginFromDreamPrompt(dream.prompt) : undefined;
  const { data: modelsData } = useModels({ mediaType: "image" });
  const images = useStudioStore((s) => s.images);
  const setImagePrompt = useStudioStore((s) => s.setImagePrompt);
  const setImageGenParams = useStudioStore((s) => s.setImageGenParams);
  const setStyleReference = useStudioStore((s) => s.setStyleReference);

  const generated = origin?.kind === "generated" ? origin : undefined;
  const modelLabel = generated
    ? modelsData?.data?.models?.find((m) => m.id === generated.algorithm)
        ?.label ?? generated.algorithm
    : undefined;

  const generateMore = () => {
    if (!generated) return;
    setImagePrompt(generated.prompt);
    // Only a model the studio offers is carried over; otherwise the prompt
    // goes to whichever model the generate dialog already has.
    if (generated.model) {
      setImageGenParams({
        model: generated.model,
        ...(generated.size ? { size: generated.size } : {}),
        negativePrompt: generated.negativePrompt ?? "",
      });
      if (generated.styleReferenceUuid) {
        const reference = generated.styleReferenceUuid;
        setStyleReference({
          uuid: reference,
          name:
            images.find((i) => i.uuid === reference)?.name ?? "Style reference",
        });
      }
    }
    onGenerateMore();
  };

  const meta = [
    modelLabel,
    generated?.size?.replace("*", "×"),
    generated?.seed !== undefined ? `seed ${generated.seed}` : undefined,
    clipCount === 0
      ? "No clips in the matrix yet."
      : `${clipCount} ${clipCount === 1 ? "clip" : "clips"} in the matrix.`,
  ].filter(Boolean);

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
          <ImageDialogThumb as={PresignedImage} dreamUuid={image.uuid} alt="" />
          {isLoading && !origin ? (
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
          </FooterButtons>
          <FooterButtons>
            <CancelBtn onClick={onClose}>Close</CancelBtn>
            {generated && <AddBtn onClick={generateMore}>Generate more</AddBtn>}
          </FooterButtons>
        </Footer>
      </ActionDialogPanel>
    </Overlay>
  );
};
