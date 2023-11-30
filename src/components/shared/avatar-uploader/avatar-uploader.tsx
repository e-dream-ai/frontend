import { FileUploader as DragDropFileUploader } from "react-drag-drop-files";
import { useTranslation } from "react-i18next";
import styled, { useTheme } from "styled-components";
import { HandleChangeFile } from "types/media.types";
import { Avatar } from "../profile-card/profile-card.styled";

const StyledFileUploaderDropzone = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  border: 1px dashed ${(props) => props.theme.inputTextColorPrimary};
  border-radius: 50%;
  cursor: pointer;
  color: blanchedalmond;
`;

/**
 * Got from https://github.com/KarimMokhtar/react-drag-drop-files/blob/dev/src/FileUploader.tsx
 */
type Props = {
  src?: string;
  name?: string;
  hoverTitle?: string;
  types?: Array<string>;
  classes?: string;
  children?: JSX.Element;
  maxSize?: number;
  minSize?: number;
  fileOrFiles?: Array<File> | File | null;
  disabled?: boolean | false;
  label?: string | undefined;
  multiple?: boolean | false;
  required?: boolean | false;
  onSizeError?: (arg0: string) => void;
  onTypeError?: (arg0: string) => void;
  onDrop?: (arg0: File | Array<File>) => void;
  onSelect?: (arg0: File | Array<File>) => void;
  handleChange?: HandleChangeFile;
  onDraggingStateChange?: (dragging: boolean) => void;
  dropMessageStyle?: React.CSSProperties | undefined;
};

export const AvatarUploader: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <DragDropFileUploader
      {...props}
      dropMessageStyle={{
        backgroundColor: theme?.inputBackgroundColor,
        opacity: 1,
      }}
    >
      <Avatar url={props.src}>
        <StyledFileUploaderDropzone>
          <span>
            <i className="fa fa-plus-circle" aria-hidden="true" />{" "}
            {t("components.file_uploader.dropzone_placeholder")}
          </span>
          <span>{props.types?.join(", ")}</span>
        </StyledFileUploaderDropzone>
      </Avatar>
    </DragDropFileUploader>
  );
};
