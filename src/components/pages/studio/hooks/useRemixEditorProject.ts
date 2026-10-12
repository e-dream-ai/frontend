import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Bugsnag from "@bugsnag/js";
import { useCreateEditorProject } from "@/api/editor-project/mutation/useCreateEditorProject";
import { buildStudioProjectPath } from "@/constants/routes.constants";
import type { StudioMode } from "@/types/flow.types";
import { EDITOR_ADAPTERS } from "../utils/editor-adapters";
import { EDITOR_STATE_SCHEMA_VERSION } from "../utils/editor-project-state";
import { UNTITLED_PROJECT_NAME } from "./useEditorProjectSync";

const PROJECT_NAME_MAX_LENGTH = 120;
const REMIX_SUFFIX = " (remix)";

const remixProjectName = (name: string) =>
  `${(name.trim() || UNTITLED_PROJECT_NAME).slice(
    0,
    PROJECT_NAME_MAX_LENGTH - REMIX_SUFFIX.length,
  )}${REMIX_SUFFIX}`;

export const useRemixEditorProject = (mode: StudioMode) => {
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useCreateEditorProject();

  const remix = useCallback(
    async (name: string) => {
      const adapter = EDITOR_ADAPTERS[mode];
      const copyName = remixProjectName(name);

      try {
        const created = await mutateAsync({
          editorId: mode,
          name: copyName,
          state: { ...adapter.read(), ...adapter.forCopy(copyName) },
          schemaVersion: EDITOR_STATE_SCHEMA_VERSION,
          thumbnailDreamUuid: adapter.thumbnailDreamUuid(),
        });
        const project = created.data?.project;
        if (!project) throw new Error("No project in create response");

        toast.success(`Remixed into ${project.name}`);
        navigate(buildStudioProjectPath(mode, project.uuid));
      } catch (error) {
        Bugsnag.notify(error as Error);
        toast.error("Could not remix this project. Try again.");
      }
    },
    [mode, mutateAsync, navigate],
  );

  return { remix, isRemixing: isLoading };
};
