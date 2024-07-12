import { FileUploader as DragDropFileUploader } from "react-drag-drop-files";
import { useTranslation } from "react-i18next";
import styled, { useTheme } from "styled-components";
import { HandleChangeFile } from "@/types/media.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { truncateArray } from "@/utils/array.util";

const StyledFileUploaderDropzone = styled.p`
  display: inline-flex;
  width: 100%;
  min-width: 322px;
  min-height: 300px;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  border: 1px dashed ${(props) => props.theme.inputTextColorPrimary};
  margin: 0;
  border-radius: 5px;
  cursor: pointer;
  -webkit-box-flex: 0;
  flex-grow: 0;
`;

/**
 * Got from https://github.com/KarimMokhtar/react-drag-drop-files/blob/dev/src/FileUploader.tsx
 */
type Props = {
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

export const FileUploader: React.FC<Props> = (props) => {
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
      <StyledFileUploaderDropzone>
        <span>
          <FontAwesomeIcon icon={faPlusCircle} aria-hidden="true" />{" "}
          {t("components.file_uploader.dropzone_placeholder")}
        </span>
        <span>{truncateArray(props.types, 3)?.join(", ")}...</span>
      </StyledFileUploaderDropzone>
    </DragDropFileUploader>
  );
};
