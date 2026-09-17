import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useApiQuery from "@/api/shared/useApiQuery";
import { editorProjectKeys } from "@/api/editor-project/editor-project.keys";
import { EditorProject } from "@/types/editor-project.types";

type EditorProjectResponse = {
  project: EditorProject;
};

export const useEditorProject = (uuid?: string, enabled = true) =>
  useApiQuery<EditorProjectResponse>(
    editorProjectKeys.detail(uuid),
    `/v2/editor-projects/${uuid ?? ""}`,
    { headers: getRequestHeaders({ contentType: ContentType.json }) },
    { refetchOnWindowFocus: false, refetchOnMount: false },
    {
      enabled: enabled && Boolean(uuid),
      staleTime: Infinity,
      keepPreviousData: false,
    },
  );
