export const EDITOR_IDS = ["flow", "action", "uprez"] as const;

export type EditorId = (typeof EDITOR_IDS)[number];

export type EditorProjectState = Record<string, unknown>;

export type EditorProjectPlaylistRef = {
  uuid: string;
  name: string;
};

export type EditorProjectSummary = {
  uuid: string;
  editorId: EditorId;
  name: string;
  revision: number;
  schemaVersion: number;
  thumbnail?: string | null;
  playlist?: EditorProjectPlaylistRef | null;
  created_at: string;
  updated_at: string;
};

export type EditorProject = EditorProjectSummary & {
  state: EditorProjectState;
};

export type CreateEditorProjectPayload = {
  editorId: EditorId;
  name: string;
  state: EditorProjectState;
  schemaVersion?: number;
  thumbnailDreamUuid?: string | null;
  playlistUuid?: string | null;
};

export type UpdateEditorProjectPayload = {
  uuid: string;
  revision: number;
  name?: string;
  state?: EditorProjectState;
  schemaVersion?: number;
  thumbnailDreamUuid?: string | null;
  playlistUuid?: string | null;
};
