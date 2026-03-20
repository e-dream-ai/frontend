import { FileUploader as DragDropFileUploader } from "react-drag-drop-files";
import { useTranslation } from "react-i18next";
import styled, { useTheme } from "styled-components";
import { HandleChangeFile } from "@/types/media.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { truncateArray } from "@/utils/array.util";
import { fileTypeFromBlob } from "file-type";

function getExtension(file: File): string {
  const dot = file.name.lastIndexOf(".");
  return dot !== -1 ? file.name.slice(dot + 1).toLowerCase() : "";
}

async function isFileTypeAllowed(
  file: File,
  types: string[],
): Promise<boolean> {
  const typesLower = types.map((t) => t.toLowerCase());
  const ext = getExtension(file);

  if (ext) {
    return typesLower.includes(ext);
  }

  try {
    const result = await fileTypeFromBlob(file);
    if (result) {
      return typesLower.includes(result.ext);
    }
  } catch {
    // ignore sniff errors
  }

  return false;
}

const StyledFileUploaderDropzone = styled.p`
  display: inline-flex;
  width: 100%;
  min-width: 322px;
  min-height: 150px;
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

  const wrappedHandleChange: HandleChangeFile | undefined = props.handleChange
    ? async (fileOrFiles) => {
        const file =
          fileOrFiles instanceof FileList ? fileOrFiles[0] : fileOrFiles;
        if (!file) return;
        if (!props.types || (await isFileTypeAllowed(file, props.types))) {
          props.handleChange!(fileOrFiles);
        } else {
          props.onTypeError?.("File type is not supported");
        }
      }
    : undefined;

  return (
    <DragDropFileUploader
      {...props}
      types={undefined}
      handleChange={wrappedHandleChange}
      dropMessageStyle={{
        backgroundColor: theme?.inputBackgroundColor,
        opacity: 1,
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: 0,
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
