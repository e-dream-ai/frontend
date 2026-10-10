import type {
  StudioAction,
  StudioImage,
  StudioJob,
} from "@/types/studio.types";
import type { PlaylistItem } from "@/types/playlist.types";
import {
  comboKeyOf,
  indexCellJobs,
  isAnimatableFrame,
  isRunnableAction,
} from "./batch-selectors";

/**
 * The rendered clips of the matrix, row by row: each image's clips in action
 * column order. This is the order the output playlist should have.
 */
export const matrixDreamUuids = (
  images: readonly StudioImage[],
  actions: readonly StudioAction[],
  jobs: readonly StudioJob[],
): string[] => {
  const cellJobs = indexCellJobs(jobs);
  const columns = actions.filter(isRunnableAction);
  const uuids: string[] = [];
  for (const image of images.filter(isAnimatableFrame)) {
    for (const action of columns) {
      const job = cellJobs.get(comboKeyOf(image.uuid, action.id));
      if (job?.status === "processed") uuids.push(job.dreamUuid);
    }
  }
  return uuids;
};

/**
 * What the output playlist is missing, and which of its items the studio
 * made but no longer shows (discarded, replaced, or in a removed row or
 * column). Items the studio did not make are left alone.
 */
export const planPlaylistChanges = (
  items: readonly PlaylistItem[],
  desired: readonly string[],
  studioDreamUuids: ReadonlySet<string>,
) => {
  const present = new Set(
    items.map((item) => item.dreamItem?.uuid).filter(Boolean),
  );
  const wanted = new Set(desired);
  return {
    add: desired.filter((uuid) => !present.has(uuid)),
    remove: items.filter((item) => {
      const uuid = item.dreamItem?.uuid;
      return uuid && studioDreamUuids.has(uuid) && !wanted.has(uuid);
    }),
  };
};

/**
 * New orders that put the matrix clips in matrix order, reusing the slots
 * they already hold so anything else in the playlist keeps its place. Null
 * when they are already in order.
 */
export const planPlaylistOrder = (
  items: readonly PlaylistItem[],
  desired: readonly string[],
): Array<{ id: number; order: number }> | null => {
  const byUuid = new Map(
    items
      .filter((item) => item.dreamItem?.uuid)
      .map((item) => [item.dreamItem!.uuid, item]),
  );
  const clips = desired
    .map((uuid) => byUuid.get(uuid))
    .filter((item): item is PlaylistItem => Boolean(item));
  const slots = clips.map((item) => item.order).sort((a, b) => a - b);
  const order = clips.map((item, i) => ({ id: item.id, order: slots[i] }));
  return order.some((o, i) => clips[i].order !== o.order) ? order : null;
};
