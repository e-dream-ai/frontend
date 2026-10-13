import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import {
  editorProjectKeys,
  EditorProjectListFilters,
} from "@/api/editor-project/editor-project.keys";
import type { EditorProjectsResponse } from "@/api/editor-project/query/useEditorProjects";
import type { EditorProject } from "@/types/editor-project.types";

export const ARCHIVE_EDITOR_PROJECT_MUTATION_KEY = "archiveEditorProject";

type ArchiveVariables = {
  uuid: string;
  archived: boolean;
};

type ArchiveResponse = ApiResponse<{ uuid: string; archivedAt: string | null }>;

type ListSnapshot = [QueryKey, ApiResponse<EditorProjectsResponse>];

type Options = {
  onError?: (error: Error, variables: ArchiveVariables) => void;
};

const setArchived = ({ uuid, archived }: ArchiveVariables) =>
  axiosClient
    .request<ArchiveResponse>({
      method: archived ? "PUT" : "DELETE",
      url: `/v2/editor-projects/${uuid}/archive`,
      headers: getRequestHeaders({ contentType: ContentType.json }),
    })
    .then((res) => res.data);

const withArchived = (
  response: ApiResponse<EditorProjectsResponse>,
  filters: EditorProjectListFilters | undefined,
  { uuid, archived }: ArchiveVariables,
  archivedAt: string | null,
): ApiResponse<EditorProjectsResponse> => {
  const data = response.data;
  if (!data?.projects.some((project) => project.uuid === uuid)) {
    return response;
  }

  const listed =
    filters?.archived === undefined || filters.archived === archived;

  return {
    ...response,
    data: listed
      ? {
          ...data,
          projects: data.projects.map((project) =>
            project.uuid === uuid ? { ...project, archivedAt } : project,
          ),
        }
      : {
          projects: data.projects.filter((project) => project.uuid !== uuid),
          count: Math.max(0, data.count - 1),
        },
  };
};

export const useArchiveEditorProject = ({ onError }: Options = {}) => {
  const queryClient = useQueryClient();

  return useMutation<
    ArchiveResponse,
    Error,
    ArchiveVariables,
    { lists: ListSnapshot[] }
  >(setArchived, {
    mutationKey: [ARCHIVE_EDITOR_PROJECT_MUTATION_KEY],
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: editorProjectKeys.lists() });

      const lists = queryClient.getQueriesData<
        ApiResponse<EditorProjectsResponse>
      >({ queryKey: editorProjectKeys.lists() });
      const archivedAt = variables.archived ? new Date().toISOString() : null;

      lists.forEach(([queryKey, response]) => {
        if (!response) return;
        const filters = queryKey[2] as EditorProjectListFilters | undefined;
        queryClient.setQueryData(
          queryKey,
          withArchived(response, filters, variables, archivedAt),
        );
      });

      return {
        lists: lists.filter((entry): entry is ListSnapshot =>
          Boolean(entry[1]),
        ),
      };
    },
    onError: (error, variables, context) => {
      context?.lists.forEach(([queryKey, response]) =>
        queryClient.setQueryData(queryKey, response),
      );
      onError?.(error, variables);
    },
    onSuccess: (response, { uuid }) => {
      const archivedAt = response.data?.archivedAt ?? null;
      queryClient.setQueryData<ApiResponse<{ project: EditorProject }>>(
        editorProjectKeys.detail(uuid),
        (current) =>
          current?.data?.project
            ? {
                ...current,
                data: { project: { ...current.data.project, archivedAt } },
              }
            : current,
      );
    },
    onSettled: () => {
      if (
        queryClient.isMutating({
          mutationKey: [ARCHIVE_EDITOR_PROJECT_MUTATION_KEY],
        }) > 1
      ) {
        return;
      }
      return queryClient.invalidateQueries({
        queryKey: editorProjectKeys.lists(),
      });
    },
  });
};
