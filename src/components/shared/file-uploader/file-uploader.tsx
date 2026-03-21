import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { HandleChangeFile } from "@/types/media.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { truncateArray } from "@/utils/array.util";
import { fileTypeFromBlob } from "file-type";
import { useCallback, useEffect, useMemo } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import {
  ALLOWED_VIDEO_TYPES,
  ALLOWED_IMAGE_TYPES,
} from "@/constants/file.constants";
import { getFileExtension } from "@/utils/file-uploader.util";

const VIDEO_EXT_SET = new Set(ALLOWED_VIDEO_TYPES.map((t) => t.toLowerCase()));
const IMAGE_EXT_SET = new Set(ALLOWED_IMAGE_TYPES.map((t) => t.toLowerCase()));

async function isFileTypeAllowed(
  file: File,
  typesLower: Set<string>,
): Promise<boolean> {
  const ext = getFileExtension(file);

  if (ext) {
    return typesLower.has(ext);
  }

  try {
    const result = await fileTypeFromBlob(file);
    if (result) {
      return typesLower.has(result.ext);
    }
  } catch {
    // ignore
  }

  return false;
}

function buildAccept(types?: string[]): Record<string, string[]> | undefined {
  if (!types) return undefined;
  const lower = types.map((t) => t.toLowerCase());
  const isVideo = lower.some((t) => VIDEO_EXT_SET.has(t));
  const isImage = lower.some((t) => IMAGE_EXT_SET.has(t));
  const accept: Record<string, string[]> = {};
  if (isVideo) accept["video/*"] = [];
  if (isImage) accept["image/*"] = [];
  if (!isVideo && !isImage) {
    lower.forEach((t) => {
      accept[`.${t}`] = [];
    });
  }
  return accept;
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

const DropOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.inputBackgroundColor};
`;

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

  const typesLower = useMemo(
    () => new Set(props.types?.map((t) => t.toLowerCase())),
    [props.types],
  );

  const accept = useMemo(() => buildAccept(props.types), [props.types]);

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
            (e) => e.code === "file-too-large" || e.code === "file-too-small",
          )
        ) {
          props.onSizeError?.("File size error");
        } else {
          props.onTypeError?.("File type is not supported");
        }
      }

      for (const file of acceptedFiles) {
        const allowed =
          !props.types || (await isFileTypeAllowed(file, typesLower));
        if (allowed) {
          props.handleChange?.(file);
          props.onDrop?.(file);
          props.onSelect?.(file);
        } else {
          props.onTypeError?.("File type is not supported");
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      typesLower,
      props.handleChange,
      props.onDrop,
      props.onSelect,
      props.onSizeError,
      props.onTypeError,
    ],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeBytes,
    minSize: minSizeBytes,
    multiple: props.multiple,
    disabled: props.disabled,
  });

  useEffect(() => {
    props.onDraggingStateChange?.(isDragActive);
  }, [isDragActive, props.onDraggingStateChange]);

  return (
    <div {...getRootProps()} style={{ position: "relative" }}>
      <input {...getInputProps()} />
      {isDragActive && (
        <DropOverlay style={props.dropMessageStyle}>
          {props.hoverTitle ?? t("components.file_uploader.drop_here")}
        </DropOverlay>
      )}
      <StyledFileUploaderDropzone>
        <span>
          <FontAwesomeIcon icon={faPlusCircle} aria-hidden="true" />{" "}
          {t("components.file_uploader.dropzone_placeholder")}
        </span>
        <span>{truncateArray(props.types, 3)?.join(", ")}...</span>
      </StyledFileUploaderDropzone>
    </div>
  );
};
