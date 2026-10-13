import { useEditorProject } from "@/api/editor-project/query/useEditorProject";
import type { EditorProject } from "@/types/editor-project.types";

export type EditorProjectAccess =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "editable" }
  | { status: "readOnly"; project: EditorProject };

export const useEditorProjectAccess = (
  projectUuid?: string,
): EditorProjectAccess => {
  const { data, isError } = useEditorProject(projectUuid);

  if (!projectUuid) return { status: "editable" };

  const project = data?.data?.project;
  if (project) {
    return project.canEdit === false
      ? { status: "readOnly", project }
      : { status: "editable" };
  }

  return isError ? { status: "missing" } : { status: "loading" };
};
