import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Bugsnag from "@bugsnag/js";
import { useEditorProject } from "@/api/editor-project/query/useEditorProject";
import { useCreateEditorProject } from "@/api/editor-project/mutation/useCreateEditorProject";
import {
  isEditorProjectConflict,
  useUpdateEditorProject,
} from "@/api/editor-project/mutation/useUpdateEditorProject";
import { isProjectLocked } from "@/api/editor-project/editor-project-lock";
import { buildStudioProjectPath } from "@/constants/routes.constants";
import {
  EditorProject,
  EditorProjectPlaylistRef,
  EditorProjectState,
} from "@/types/editor-project.types";
import type { StudioMode } from "@/types/flow.types";
import { EDITOR_ADAPTERS } from "../utils/editor-adapters";
import { EDITOR_STATE_SCHEMA_VERSION } from "../utils/editor-project-state";

export const SAVE_DEBOUNCE_MS = 2000;

export type ProjectSyncStatus =
  | "idle"
  | "loading"
  | "saving"
  | "saved"
  | "error";

export const UNTITLED_PROJECT_NAME = "Untitled";

export const useEditorProjectSync = (
  mode: StudioMode,
  projectUuid?: string,
  canSave = true,
) => {
  const navigate = useNavigate();
  const adapter = EDITOR_ADAPTERS[mode];

  const { data, isLoading } = useEditorProject(projectUuid);
  const createProject = useCreateEditorProject();
  const updateProject = useUpdateEditorProject();

  const [status, setStatus] = useState<ProjectSyncStatus>("idle");
  const [conflict, setConflict] = useState<EditorProject | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [playlist, setPlaylist] = useState<EditorProjectPlaylistRef | null>(
    null,
  );

  const revisionRef = useRef<number>(0);
  const hydratingRef = useRef(false);
  const hydratedUuidRef = useRef<string | undefined>();
  const creatingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSavedRef = useRef<string>("");
  const persistRef = useRef<() => Promise<void>>(async () => {});

  const loadedProject = data?.data?.project;
  const displayStatus: ProjectSyncStatus =
    isLoading && projectUuid ? "loading" : status;

  const hydrate = useCallback(
    (project: EditorProject) => {
      hydratingRef.current = true;
      adapter.reset();
      adapter.write(project.state);
      revisionRef.current = project.revision;
      lastSavedRef.current = JSON.stringify(adapter.read());
      setProjectName(project.name);
      setPlaylist(project.playlist ?? null);
      hydratedUuidRef.current = project.uuid;
      setStatus("saved");
      hydratingRef.current = false;
    },
    [adapter],
  );

  useEffect(() => {
    if (projectUuid && projectUuid === hydratedUuidRef.current) return;

    hydratingRef.current = true;
    adapter.reset();
    hydratedUuidRef.current = undefined;
    revisionRef.current = 0;
    lastSavedRef.current = "";
    setProjectName("");
    setPlaylist(null);
    setStatus("idle");
    hydratingRef.current = false;
  }, [projectUuid, adapter]);

  useEffect(() => {
    if (!projectUuid || !loadedProject) return;
    if (loadedProject.uuid === hydratedUuidRef.current) return;

    hydrate(loadedProject);
  }, [projectUuid, loadedProject, hydrate]);

  const persist = useCallback(async () => {
    if (hydratingRef.current || conflict || !canSave) return;

    const state = adapter.read();
    const serialised = JSON.stringify(state);
    if (serialised === lastSavedRef.current) return;

    const uuid = hydratedUuidRef.current;

    if (!uuid) {
      if (creatingRef.current || adapter.isEmpty()) return;
      creatingRef.current = true;
      setStatus("saving");
      try {
        const created = await createProject.mutateAsync({
          editorId: mode,
          name: UNTITLED_PROJECT_NAME,
          state,
          schemaVersion: EDITOR_STATE_SCHEMA_VERSION,
          thumbnailDreamUuid: adapter.thumbnailDreamUuid(),
        });

        const project = created.data?.project;
        if (!project) throw new Error("No project in create response");

        revisionRef.current = project.revision;
        lastSavedRef.current = serialised;
        hydratedUuidRef.current = project.uuid;
        setProjectName(project.name);
        setStatus("saved");
        navigate(buildStudioProjectPath(mode, project.uuid), { replace: true });
      } catch (error) {
        Bugsnag.notify(error as Error);
        setStatus("error");
      } finally {
        creatingRef.current = false;
      }
      return;
    }

    setStatus("saving");
    try {
      const saved = await updateProject.mutateAsync({
        uuid,
        revision: revisionRef.current,
        state,
        schemaVersion: EDITOR_STATE_SCHEMA_VERSION,
        thumbnailDreamUuid: adapter.thumbnailDreamUuid(),
      });
      const project = saved.data?.project;
      if (project) revisionRef.current = project.revision;
      lastSavedRef.current = serialised;
      setStatus("saved");
    } catch (error) {
      if (isProjectLocked(error)) {
        setStatus("idle");
        return;
      }
      if (isEditorProjectConflict(error)) {
        setConflict(error.serverProject ?? null);
        setStatus("error");
        return;
      }
      Bugsnag.notify(error as Error);
      setStatus("error");
    }
  }, [
    adapter,
    canSave,
    conflict,
    createProject,
    mode,
    navigate,
    updateProject,
  ]);

  useEffect(() => {
    persistRef.current = persist;
  });

  useEffect(() => {
    const schedule = () => {
      if (hydratingRef.current) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = undefined;
        void persistRef.current();
      }, SAVE_DEBOUNCE_MS);
    };

    const unsubscribe = adapter.subscribe(schedule);
    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
        void persistRef.current();
      }
    };
  }, [adapter]);

  const takeServerVersion = useCallback(() => {
    if (!conflict) return;
    hydrate(conflict);
    setConflict(null);
  }, [conflict, hydrate]);

  const overwriteServerVersion = useCallback(async () => {
    if (!conflict) return;

    const state = adapter.read();
    const serialised = JSON.stringify(state);
    setStatus("saving");

    try {
      const saved = await updateProject.mutateAsync({
        uuid: conflict.uuid,
        revision: conflict.revision,
        state,
        schemaVersion: EDITOR_STATE_SCHEMA_VERSION,
        thumbnailDreamUuid: adapter.thumbnailDreamUuid(),
      });
      const project = saved.data?.project;
      if (project) revisionRef.current = project.revision;
      lastSavedRef.current = serialised;
      setConflict(null);
      setStatus("saved");
    } catch (error) {
      if (isEditorProjectConflict(error)) {
        setConflict(error.serverProject ?? null);
        setStatus("error");
        return;
      }
      Bugsnag.notify(error as Error);
      setStatus("error");
    }
  }, [adapter, conflict, updateProject]);

  const keepMineAsNewProject = useCallback(async () => {
    const state = adapter.read();
    try {
      const created = await createProject.mutateAsync({
        editorId: mode,
        name: `${projectName || UNTITLED_PROJECT_NAME} (copy)`,
        state,
        schemaVersion: EDITOR_STATE_SCHEMA_VERSION,
      });
      const project = created.data?.project;
      if (!project) throw new Error("No project in create response");

      revisionRef.current = project.revision;
      lastSavedRef.current = JSON.stringify(state);
      hydratedUuidRef.current = project.uuid;
      setProjectName(project.name);
      setConflict(null);
      setStatus("saved");
      navigate(buildStudioProjectPath(mode, project.uuid), { replace: true });
    } catch (error) {
      Bugsnag.notify(error as Error);
      setStatus("error");
    }
  }, [adapter, createProject, mode, navigate, projectName]);

  const attachPlaylist = useCallback(
    async (next: EditorProjectPlaylistRef) => {
      const uuid = hydratedUuidRef.current;
      setPlaylist(next);
      setProjectName(next.name);
      if (!uuid) return;

      try {
        const saved = await updateProject.mutateAsync({
          uuid,
          revision: revisionRef.current,
          playlistUuid: next.uuid,
          name: next.name,
        });
        const project = saved.data?.project;
        if (project) revisionRef.current = project.revision;
      } catch (error) {
        if (isProjectLocked(error)) return;
        if (isEditorProjectConflict(error)) {
          setConflict(error.serverProject ?? null);
          return;
        }
        Bugsnag.notify(error as Error);
      }
    },
    [updateProject],
  );

  return {
    status: displayStatus,
    conflict,
    playlist,
    attachPlaylist,
    takeServerVersion,
    overwriteServerVersion,
    keepMineAsNewProject,
  };
};

export type EditorProjectSync = ReturnType<typeof useEditorProjectSync>;
export type { EditorProjectState };
