import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { editorProjectKeys } from "@/api/editor-project/editor-project.keys";

export const DELETE_EDITOR_PROJECT_MUTATION_KEY = "deleteEditorProject";

const deleteEditorProject = async (uuid: string) =>
  axiosClient
    .delete(`/v2/editor-projects/${uuid}`, {
      headers: getRequestHeaders({ contentType: ContentType.json }),
    })
    .then((res) => res.data);

export const useDeleteEditorProject = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ uuid: string }>, Error, string>(
    deleteEditorProject,
    {
      mutationKey: [DELETE_EDITOR_PROJECT_MUTATION_KEY],
      onSuccess: (_response, uuid) => {
        queryClient.removeQueries({ queryKey: editorProjectKeys.detail(uuid) });
        void queryClient.invalidateQueries({
          queryKey: editorProjectKeys.lists(),
        });
      },
    },
  );
};
