import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useApiQuery from "@/api/shared/useApiQuery";
import {
  editorProjectKeys,
  EditorProjectListFilters,
} from "@/api/editor-project/editor-project.keys";
import { EditorProjectSummary } from "@/types/editor-project.types";

export const EDITOR_PROJECT_LIST_STALE_TIME = 30_000;

type EditorProjectsResponse = {
  projects: EditorProjectSummary[];
  count: number;
};

type Params = EditorProjectListFilters & {
  enabled?: boolean;
};

const buildQueryString = (filters: EditorProjectListFilters) => {
  const params = new URLSearchParams();
  if (filters.editorId) params.set("editorId", filters.editorId);
  if (filters.playlistUuid) params.set("playlistUuid", filters.playlistUuid);
  if (filters.take !== undefined) params.set("take", String(filters.take));
  if (filters.skip !== undefined) params.set("skip", String(filters.skip));
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const useEditorProjects = ({
  enabled = true,
  ...filters
}: Params = {}) =>
  useApiQuery<EditorProjectsResponse>(
    editorProjectKeys.list(filters),
    `/v2/editor-projects${buildQueryString(filters)}`,
    { headers: getRequestHeaders({ contentType: ContentType.json }) },
    { refetchOnMount: true },
    { enabled, staleTime: EDITOR_PROJECT_LIST_STALE_TIME },
  );

export const useEditorProjectByPlaylist = (
  playlistUuid?: string,
  enabled = true,
) => {
  const query = useEditorProjects({
    playlistUuid,
    take: 1,
    enabled: enabled && Boolean(playlistUuid),
  });

  return { ...query, project: query.data?.data?.projects?.[0] };
};
