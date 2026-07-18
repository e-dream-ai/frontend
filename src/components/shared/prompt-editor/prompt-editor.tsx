import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faUpDown } from "@fortawesome/free-solid-svg-icons";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { linter, Diagnostic } from "@codemirror/lint";
import { materialDark } from "@uiw/codemirror-theme-material";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  ControllerRenderProps,
  FieldValues,
  Path,
  UseFormClearErrors,
  UseFormGetValues,
  UseFormSetError,
} from "react-hook-form";
import styled from "styled-components";
import {
  TextAreaGroup,
  TextAreaRow,
  TextAreaBefore,
} from "@/components/shared/text-area/text-area.styled";

const CodeMirrorWrapper = styled.div<{
  disabled?: boolean;
  height?: number;
  maxHeight?: number;
}>`
  width: 100%;
  width: -moz-available;
  width: -webkit-fill-available;
  width: fill-available;
  min-height: 2.5rem;
  height: ${(props) => (props.height ? `${props.height}px` : "2.5rem")};
  max-height: ${(props) => (props.maxHeight ? `${props.maxHeight}px` : "8rem")};
  overflow-y: auto;
  overflow-x: hidden;
  background: ${(props) =>
    props.disabled
      ? props.theme.inputBackgroundColor
      : props.theme.colorBackgroundSecondary};
  border-radius: 0;
  border: 0;
  display: flex;
  flex-direction: column;
  align-self: stretch;
  position: relative;

  .cm-editor {
    background: transparent !important;
    font-size: 1rem;
  }

  .cm-scroller {
    overflow-x: auto;
  }

  .cm-content {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .cm-gutters {
    background: transparent !important;
    border: 0;
  }

  .cm-line {
    font-family: "Roboto Mono", monospace;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const ResizeHandle = styled(motion.div)`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  cursor: ns-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.textSecondaryColor};
  opacity: 0.6;
  transition: opacity 0.2s;
  z-index: 10;
  background: ${(props) => props.theme.colorBackgroundSecondary};

  &:hover {
    opacity: 1;
  }

  svg {
    font-size: 16px;
  }
`;

const calculatePromptContentHeight = (content: string): number => {
  if (!content || content.trim() === "" || content === "{}") {
    return 40;
  }

  const lines = content.split("\n").length;
  const lineHeight = 24;
  const padding = 12;
  const calculatedHeight = Math.max(40, lines * lineHeight + padding);
  const maxHeight = 128;

  return Math.min(calculatedHeight, maxHeight);
};

export type PromptEditorProps<T extends FieldValues> = {
  field: ControllerRenderProps<T, Path<T>>;
  editMode: boolean;
  /** Message shown (toast + field error) when the JSON is invalid. */
  invalidJsonMessage: string;
  onPromptValidationRequest?: (validate: () => boolean) => void;
  onPromptResetRequest?: (reset: () => void) => void;
  clearErrors: UseFormClearErrors<T>;
  setError: UseFormSetError<T>;
  getValues: UseFormGetValues<T>;
};

/**
 * Editable JSON prompt editor backed by CodeMirror. Reused by the dream and
 * playlist pages so the prompt field looks and behaves identically on both.
 */
export function PromptEditor<T extends FieldValues>({
  field,
  editMode,
  invalidJsonMessage,
  onPromptValidationRequest,
  onPromptResetRequest,
  clearErrors,
  setError,
  getValues,
}: PromptEditorProps<T>) {
  const promptStringRef = useRef<string>(
    field.value ? JSON.stringify(field.value, null, 2) : "{}",
  );
  const [editorHeight, setEditorHeight] = useState<number | undefined>(
    undefined,
  );
  const [isManuallyResized, setIsManuallyResized] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(40);
  const codeMirrorWrapperRef = useRef<HTMLDivElement>(null);
  const scrollOffset = useMotionValue<number>(0);
  const smoothScrollOffset = useSpring(scrollOffset, {
    stiffness: 1100,
    damping: 120,
    mass: 0.2,
  });
  const handlePosition = useTransform(smoothScrollOffset, (value) => -value);

  useEffect(() => {
    if (!editMode) {
      promptStringRef.current = field.value
        ? JSON.stringify(field.value, null, 2)
        : "{}";
    }

    if (isManuallyResized) {
      return;
    }

    const content = field.value ? JSON.stringify(field.value, null, 2) : "{}";
    if (!isDraggingRef.current) {
      setEditorHeight(calculatePromptContentHeight(content));
    }
  }, [editMode, field.value, isManuallyResized]);

  useEffect(() => {
    if (!onPromptValidationRequest) {
      return;
    }

    onPromptValidationRequest(() => {
      try {
        JSON.parse(promptStringRef.current);
        clearErrors(field.name);
        return true;
      } catch {
        if (
          promptStringRef.current.trim() !== "" &&
          promptStringRef.current !== "{}"
        ) {
          setError(field.name, {
            type: "manual",
            message: invalidJsonMessage,
          });
          toast.error(invalidJsonMessage);
          return false;
        }

        return true;
      }
    });
  }, [
    clearErrors,
    field.name,
    invalidJsonMessage,
    onPromptValidationRequest,
    setError,
  ]);

  useEffect(() => {
    if (!onPromptResetRequest) {
      return;
    }

    onPromptResetRequest(() => {
      const currentValue = getValues(field.name);
      promptStringRef.current = currentValue
        ? JSON.stringify(currentValue, null, 2)
        : "{}";
      clearErrors(field.name);
    });
  }, [clearErrors, field.name, getValues, onPromptResetRequest]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsManuallyResized(true);
      isDraggingRef.current = true;
      startYRef.current = e.clientY;
      startHeightRef.current = editorHeight ?? 40;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDraggingRef.current) {
          return;
        }

        const deltaY = moveEvent.clientY - startYRef.current;
        const newHeight = Math.max(
          40,
          Math.min(800, startHeightRef.current + deltaY),
        );
        setEditorHeight(newHeight);
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [editorHeight],
  );

  const handleChange = useCallback(
    (value: string) => {
      if (!editMode) {
        return;
      }

      promptStringRef.current = value;

      if (!isManuallyResized && !isDraggingRef.current) {
        setEditorHeight(calculatePromptContentHeight(value));
      }

      try {
        field.onChange(JSON.parse(value));
        clearErrors(field.name);
      } catch {
        clearErrors(field.name);
      }
    },
    [clearErrors, editMode, field, isManuallyResized],
  );

  const handleScroll = useCallback(() => {
    scrollOffset.set(codeMirrorWrapperRef.current?.scrollTop ?? 0);
  }, [scrollOffset]);

  useEffect(() => {
    const wrapper = codeMirrorWrapperRef.current;
    if (!wrapper) {
      return;
    }

    wrapper.addEventListener("scroll", handleScroll);
    return () => {
      wrapper.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const jsonLinter = useMemo(
    () =>
      linter((view) => {
        const diagnostics: Diagnostic[] = [];
        const content = view.state.doc.toString();

        if (!content.trim() || !editMode) {
          return diagnostics;
        }

        try {
          JSON.parse(content);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Invalid JSON";

          const match = errorMessage.match(/position (\d+)/);
          const position = match ? parseInt(match[1], 10) : 0;

          const from = Math.max(0, position);
          let to = Math.min(content.length, position + 1);

          if (from === to && from === 0) {
            to = Math.min(content.length, 50);
          }

          diagnostics.push({
            from,
            to,
            severity: "error",
            message: errorMessage,
          });
        }

        return diagnostics;
      }),
    [editMode],
  );

  return (
    <TextAreaGroup>
      <TextAreaRow>
        <TextAreaBefore>
          <FontAwesomeIcon icon={faComment} />
        </TextAreaBefore>
        <CodeMirrorWrapper
          ref={codeMirrorWrapperRef}
          disabled={!editMode}
          height={editorHeight}
          maxHeight={isManuallyResized ? 800 : 128}
        >
          <CodeMirror
            value={promptStringRef.current}
            onChange={handleChange}
            extensions={[json(), jsonLinter]}
            theme={materialDark}
            editable={editMode}
            readOnly={!editMode}
            basicSetup={{
              lineNumbers: false,
              foldGutter: true,
              highlightActiveLine: false,
              highlightActiveLineGutter: false,
              highlightSelectionMatches: false,
            }}
          />
          <ResizeHandle
            style={{ bottom: handlePosition }}
            onMouseDown={handleMouseDown}
          >
            <FontAwesomeIcon icon={faUpDown} />
          </ResizeHandle>
        </CodeMirrorWrapper>
      </TextAreaRow>
    </TextAreaGroup>
  );
}

export default PromptEditor;
