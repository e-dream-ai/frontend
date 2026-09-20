import { useMemo } from "react";
import { useEditorProjects } from "@/api/editor-project/query/useEditorProjects";
import type { Dream } from "@/types/dream.types";

const STUDIO_LOOKUP_TAKE = 200;

export const useEditorProjectForDream = (dream?: Dream, enabled = true) => {
  const playlistUuids = useMemo(() => {
    const uuids = (dream?.playlistItems ?? [])
      .map((item) => item.playlist?.uuid)
      .filter((uuid): uuid is string => Boolean(uuid));

    return Array.from(new Set(uuids));
  }, [dream?.playlistItems]);

  const { data } = useEditorProjects({
    take: STUDIO_LOOKUP_TAKE,
    enabled: enabled && playlistUuids.length > 0,
  });

  return useMemo(() => {
    if (playlistUuids.length === 0) return undefined;

    const wanted = new Set(playlistUuids);
    return data?.data?.projects?.find(
      (project) => project.playlist && wanted.has(project.playlist.uuid),
    );
  }, [data, playlistUuids]);
};
