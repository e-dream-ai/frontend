import { useImageOrigin } from "../hooks/useImageOrigin";
import {
  Details,
  DetailsPrompt,
  DetailsMeta,
  DetailsButtons,
  DetailsButton,
  DetailsDeleteButton,
  DetailsText,
  DetailsTitleLine,
  DetailsName,
} from "./image-details.styled";

interface Props {
  dreamUuid: string;
  name: string;
  /** Called after the frame's prompt and settings are loaded for generating. */
  onRemix: () => void;
  onDelete: () => void;
}

/**
 * A frame's name, settings and prompt, with Remove and Remix, under the image in
 * the flow and action lightboxes.
 */
export const ImageDetails: React.FC<Props> = ({
  dreamUuid,
  name,
  onRemix,
  onDelete,
}) => {
  const { loading, generated, settings, remix } = useImageOrigin(dreamUuid);

  return (
    <Details>
      <DetailsText>
        <DetailsTitleLine>
          <DetailsName>{name}</DetailsName>
          {settings.length > 0 && (
            <DetailsMeta>{settings.join(" · ")}</DetailsMeta>
          )}
        </DetailsTitleLine>
        <DetailsPrompt>
          {loading
            ? "Loading…"
            : generated
              ? generated.prompt
              : "Uploaded image, no prompt."}
        </DetailsPrompt>
        {generated?.negativePrompt && (
          <DetailsMeta>Negative: {generated.negativePrompt}</DetailsMeta>
        )}
      </DetailsText>
      <DetailsButtons>
        <DetailsDeleteButton type="button" onClick={onDelete}>
          Remove
        </DetailsDeleteButton>
        {generated && (
          <DetailsButton
            type="button"
            onClick={() => {
              remix();
              onRemix();
            }}
          >
            Remix
          </DetailsButton>
        )}
      </DetailsButtons>
    </Details>
  );
};
