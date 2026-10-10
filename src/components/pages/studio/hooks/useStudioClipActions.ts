import { useCallback } from "react";
import { useStudioStore } from "@/stores/studio.store";
import type { StudioJob } from "@/types/studio.types";
import { comboKeyOf } from "../utils/batch-selectors";

// The output playlist follows the matrix through useActionPlaylistSync, so
// none of these touch it.

/**
 * Discards a clip that did not come out well: gone from the matrix, the
 * preview and the output playlist, and its cell back to empty and unchecked so
 * the next Generate does not simply make it again. A rendered clip is kept in
 * history, where it can be restored.
 */
export const useDiscardStudioClip = () =>
  useCallback((job: StudioJob) => {
    const store = useStudioStore.getState();
    const comboKey = comboKeyOf(job.imageId, job.actionId);
    store.archiveJob(job.dreamUuid);
    store.setComboExcluded(comboKey, true);
    if (store.rerenderCombos.has(comboKey)) {
      store.toggleComboRerender(comboKey);
    }
  }, []);

/**
 * Discards every clip of the matching cells, as the × on each would: out of
 * the matrix, the preview and the output playlist, rendered ones into history.
 * Clips still rendering are dropped.
 */
const useDiscardStudioClipsWhere = () =>
  useCallback((matches: (job: StudioJob) => boolean) => {
    const store = useStudioStore.getState();
    const discarded = store.jobs
      .filter((j) => j.jobType !== "uprez" && matches(j))
      .map((j) => j.dreamUuid);
    if (discarded.length === 0) return;
    store.archiveJobs(discarded);
  }, []);

/** Removes an action, discarding the clips it rendered. */
export const useRemoveStudioAction = () => {
  const discardWhere = useDiscardStudioClipsWhere();
  return useCallback(
    (actionId: string) => {
      discardWhere((j) => j.actionId === actionId);
      useStudioStore.getState().removeAction(actionId);
    },
    [discardWhere],
  );
};

/** Removes a reference image, discarding the clips rendered from it. */
export const useRemoveStudioImage = () => {
  const discardWhere = useDiscardStudioClipsWhere();
  return useCallback(
    (imageUuid: string) => {
      discardWhere((j) => j.imageId === imageUuid);
      useStudioStore.getState().removeImage(imageUuid);
    },
    [discardWhere],
  );
};

/**
 * Puts a history clip back in its cell, the output playlist and the preview
 * rotation. Whatever the cell held goes the other way. Returns false when the
 * cell is still rendering and nothing was restored.
 */
export const useRestoreStudioClip = () =>
  useCallback(
    (dreamUuid: string) =>
      Boolean(useStudioStore.getState().restoreJob(dreamUuid)),
    [],
  );
