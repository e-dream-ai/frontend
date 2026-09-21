import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useApiQuery from "@/api/shared/useApiQuery";
import { axiosClient } from "@/client/axios.client";
import { editorProjectKeys } from "@/api/editor-project/editor-project.keys";
import { ApiResponse } from "@/types/api.types";
import { EditorProject } from "@/types/editor-project.types";

type EditorProjectResponse = {
  project: EditorProject;
};

export const editorProjectPath = (uuid?: string) =>
  `/v2/editor-projects/${uuid ?? ""}`;

export const editorProjectDetailQuery = (uuid: string) => ({
  queryKey: editorProjectKeys.detail(uuid),
  queryFn: () =>
    axiosClient
      .get<ApiResponse<EditorProjectResponse>>(editorProjectPath(uuid), {
        headers: getRequestHeaders({ contentType: ContentType.json }),
      })
      .then((res) => res.data),
  staleTime: Infinity,
});

export const useEditorProject = (uuid?: string, enabled = true) =>
  useApiQuery<EditorProjectResponse>(
    editorProjectKeys.detail(uuid),
    editorProjectPath(uuid),
    { headers: getRequestHeaders({ contentType: ContentType.json }) },
    { refetchOnWindowFocus: false, refetchOnMount: false },
    {
      enabled: enabled && Boolean(uuid),
      staleTime: Infinity,
      keepPreviousData: false,
    },
  );
