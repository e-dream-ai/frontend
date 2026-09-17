import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { editorProjectKeys } from "@/api/editor-project/editor-project.keys";
import {
  CreateEditorProjectPayload,
  EditorProject,
} from "@/types/editor-project.types";

export const CREATE_EDITOR_PROJECT_MUTATION_KEY = "createEditorProject";

const createEditorProject = async (payload: CreateEditorProjectPayload) =>
  axiosClient
    .post("/v2/editor-projects", payload, {
      headers: getRequestHeaders({ contentType: ContentType.json }),
    })
    .then((res) => res.data);

export const useCreateEditorProject = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ project: EditorProject }>,
    Error,
    CreateEditorProjectPayload
  >(createEditorProject, {
    mutationKey: [CREATE_EDITOR_PROJECT_MUTATION_KEY],
    onSuccess: (response) => {
      const project = response.data?.project;
      if (project) {
        queryClient.setQueryData(
          editorProjectKeys.detail(project.uuid),
          response,
        );
      }
      void queryClient.invalidateQueries({
        queryKey: editorProjectKeys.lists(),
      });
    },
  });
};
