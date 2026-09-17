import { useEffect } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import Bugsnag from "@bugsnag/js";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { editorProjectKeys } from "@/api/editor-project/editor-project.keys";
import useAuth from "@/hooks/useAuth";
import { EDITOR_STATE_SCHEMA_VERSION } from "../utils/editor-project-state";
import {
  clearLegacySessions,
  planSessionMigration,
  readLegacySessions,
} from "../utils/migrate-sessions";

const migratingUsers = new Set<string>();

export const useSessionMigration = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userUuid = user?.uuid;

  useEffect(() => {
    if (!userUuid || migratingUsers.has(userUuid)) return;

    const sessions = readLegacySessions();
    if (sessions.length === 0) {
      clearLegacySessions();
      return;
    }

    migratingUsers.add(userUuid);
    let cancelled = false;

    const run = async () => {
      const pending = planSessionMigration(sessions);

      try {
        for (const project of pending) {
          if (cancelled) return;

          try {
            await axiosClient.post(
              "/v2/editor-projects",
              { ...project, schemaVersion: EDITOR_STATE_SCHEMA_VERSION },
              { headers: getRequestHeaders({ contentType: ContentType.json }) },
            );
          } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
              continue;
            }
            throw error;
          }
        }

        if (cancelled) return;
        clearLegacySessions();
        void queryClient.invalidateQueries({
          queryKey: editorProjectKeys.lists(),
        });
      } catch (error) {
        migratingUsers.delete(userUuid);
        Bugsnag.notify(error as Error);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [userUuid, queryClient]);
};
