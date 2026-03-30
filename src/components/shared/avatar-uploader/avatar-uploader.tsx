import { fileTypeFromBlob } from "file-type";
import { HandleChangeFile } from "@/types/media.types";
import { Avatar } from "@/components/shared/avatar/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useMemo } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import styled, { useTheme } from "styled-components";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_FILE_SIZE_MB,
} from "@/constants/file.constants";
import { getFileExtension } from "@/utils/file-uploader.util";

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

const DropOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 1;
`;

const IMAGE_EXT_SET = new Set(
  ALLOWED_IMAGE_TYPES.map((type) => type.toLowerCase()),
);

async function isFileTypeAllowed(file: File): Promise<boolean> {
  const ext = getFileExtension(file);

  if (ext) {
    return IMAGE_EXT_SET.has(ext);
  }

  try {
    const result = await fileTypeFromBlob(file);
    if (result) {
      return IMAGE_EXT_SET.has(result.ext);
    }
  } catch {
    // ignore
  }

  return false;
}

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
  const maxSizeBytes = useMemo(
    () => (props.maxSize ? props.maxSize * 1024 * 1024 : undefined),
    [props.maxSize],
  );

  const minSizeBytes = useMemo(
    () => (props.minSize ? props.minSize * 1024 * 1024 : undefined),
    [props.minSize],
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      for (const rejection of rejectedFiles) {
        if (
          rejection.errors.some(
            (error) =>
              error.code === "file-too-large" ||
              error.code === "file-too-small",
          )
        ) {
          props.onSizeError?.("File size error");
        } else {
          props.onTypeError?.("File type is not supported");
        }
      }

      const [file] = acceptedFiles;

      if (!file) return;

      const isAllowed = await isFileTypeAllowed(file);

      if (!isAllowed) {
        props.onTypeError?.("File type is not supported");
        return;
      }

      props.handleChange?.(file);
      props.onDrop?.(file);
      props.onSelect?.(file);
    },
    [props],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: maxSizeBytes ?? MAX_IMAGE_FILE_SIZE_MB * 1024 * 1024,
    minSize: minSizeBytes,
    multiple: false,
    disabled: props.disabled,
  });

  useEffect(() => {
    props.onDraggingStateChange?.(isDragActive);
  }, [isDragActive, props.onDraggingStateChange]);

  return (
    <div
      {...getRootProps()}
      className={props.classes}
      style={{ position: "relative", borderRadius: "50%" }}
    >
      <input
        {...getInputProps({
          name: props.name,
          disabled: props.disabled,
          required: props.required,
        })}
      />
      {isDragActive && (
        <DropOverlay
          style={{
            backgroundColor: theme?.inputBackgroundColor,
            opacity: 1,
            ...props.dropMessageStyle,
          }}
        >
          {props.hoverTitle ?? "Drop Here"}
        </DropOverlay>
      )}
      <Avatar size="lg" url={props.src}>
        <StyledFileUploaderDropzone>
          <span>
            <FontAwesomeIcon icon={faPlusSquare} aria-hidden="true" />
          </span>
        </StyledFileUploaderDropzone>
      </Avatar>
    </div>
  );
};
