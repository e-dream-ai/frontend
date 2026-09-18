import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { editorProjectKeys } from "@/api/editor-project/editor-project.keys";
import {
  EDITOR_SESSION_ID,
  EditorProjectLockedError,
} from "@/api/editor-project/editor-project-lock";
import {
  EditorProject,
  UpdateEditorProjectPayload,
} from "@/types/editor-project.types";

export const UPDATE_EDITOR_PROJECT_MUTATION_KEY = "updateEditorProject";

export class EditorProjectConflictError extends Error {
  readonly serverProject?: EditorProject;

  constructor(message: string, serverProject?: EditorProject) {
    super(message);
    this.name = "EditorProjectConflictError";
    this.serverProject = serverProject;
  }
}

export const isEditorProjectConflict = (
  error: unknown,
): error is EditorProjectConflictError =>
  error instanceof EditorProjectConflictError;

const updateEditorProject = async ({
  uuid,
  ...body
}: UpdateEditorProjectPayload) => {
  try {
    const res = await axiosClient.put(
      `/v2/editor-projects/${uuid}`,
      { ...body, sessionId: EDITOR_SESSION_ID },
      { headers: getRequestHeaders({ contentType: ContentType.json }) },
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 423) {
      const data = error.response.data as
        | { data?: { lock?: { lockedAt?: string | null } } }
        | undefined;
      throw new EditorProjectLockedError(data?.data?.lock?.lockedAt);
    }

    if (axios.isAxiosError(error) && error.response?.status === 409) {
      const data = error.response.data as
        | ApiResponse<{ project?: EditorProject }>
        | undefined;
      throw new EditorProjectConflictError(
        data?.message ?? "This project was changed elsewhere.",
        data?.data?.project,
      );
    }
    throw error;
  }
};

export const useUpdateEditorProject = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ project: EditorProject }>,
    Error,
    UpdateEditorProjectPayload
  >(updateEditorProject, {
    mutationKey: [UPDATE_EDITOR_PROJECT_MUTATION_KEY],
    retry: false,
    onSuccess: (response, { uuid }) => {
      queryClient.setQueryData(editorProjectKeys.detail(uuid), response);
      void queryClient.invalidateQueries({
        queryKey: editorProjectKeys.lists(),
      });
    },
    onError: (error, { uuid }) => {
      if (isEditorProjectConflict(error) && error.serverProject) {
        queryClient.setQueryData(editorProjectKeys.detail(uuid), {
          success: true,
          data: { project: error.serverProject },
        });
      }
    },
  });
};
