import { EditorId } from "@/types/editor-project.types";

export type EditorProjectListFilters = {
  editorId?: EditorId;
  playlistUuid?: string;
  search?: string;
  take?: number;
  skip?: number;
};

export const editorProjectKeys = {
  all: ["editorProjects"] as const,
  lists: () => [...editorProjectKeys.all, "list"] as const,
  list: (filters: EditorProjectListFilters) =>
    [...editorProjectKeys.lists(), filters] as const,
  details: () => [...editorProjectKeys.all, "detail"] as const,
  detail: (uuid?: string) => [...editorProjectKeys.details(), uuid] as const,
};
