import { FileUploader as DragDropFileUploader } from "react-drag-drop-files";
import styled, { useTheme } from "styled-components";
import { HandleChangeFile } from "@/types/media.types";
import { Avatar } from "@/components/shared/avatar/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare } from "@fortawesome/free-solid-svg-icons";

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
  font-size: 2rem;
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
  const theme = useTheme();

  return (
    <DragDropFileUploader
      {...props}
      dropMessageStyle={{
        backgroundColor: theme?.inputBackgroundColor,
        opacity: 1,
      }}
    >
      <Avatar size="lg" url={props.src}>
        <StyledFileUploaderDropzone>
          <span>
            <FontAwesomeIcon icon={faPlusSquare} aria-hidden="true" />
          </span>
        </StyledFileUploaderDropzone>
      </Avatar>
    </DragDropFileUploader>
  );
};
