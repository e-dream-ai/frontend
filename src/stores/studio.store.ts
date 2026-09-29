import { create } from "zustand";
import { retargetActionsLoras } from "@/components/pages/studio/constants/lora-options";
import {
  comboKeyOf,
  findCellJob,
  isJobInFlight,
} from "@/components/pages/studio/utils/batch-selectors";
import type {
  Removed,
  StudioTab,
  StudioImage,
  StyleReference,
  StudioAction,
  StudioJob,
  ImageGenParams,
  VideoGenParams,
} from "@/types/studio.types";

type StudioState = {
  activeTab: StudioTab;
  setActiveTab: (tab: StudioTab) => void;

  imagePrompt: string;
  setImagePrompt: (prompt: string) => void;
  styleReference: StyleReference | null;
  setStyleReference: (reference: StyleReference | null) => void;
  imageGenParams: ImageGenParams;
  setImageGenParams: (params: Partial<ImageGenParams>) => void;
  images: StudioImage[];
  addImage: (image: StudioImage) => void;
  updateImage: (uuid: string, updates: Partial<StudioImage>) => void;
  removeImage: (uuid: string) => void;
  /**
   * Images and actions taken out of the project, with where they stood, so
   * restoring one of their clips from history can put them back.
   */
  removedImages: Removed<StudioImage>[];
  removedActions: Removed<StudioAction>[];

  actions: StudioAction[];
  addAction: (action: StudioAction) => void;
  updateAction: (id: string, updates: Partial<StudioAction>) => void;
  removeAction: (id: string) => void;
  loadPresetPack: (actions: StudioAction[]) => void;

  videoGenParams: VideoGenParams;
  setVideoGenParams: (params: Partial<VideoGenParams>) => void;
  outputPlaylistId: string | null;
  setOutputPlaylistId: (id: string | null) => void;

  excludedCombos: Set<string>;
  toggleComboExcluded: (key: string) => void;
  setComboExcluded: (key: string, excluded: boolean) => void;
  /**
   * Rendered cells picked to render again with the current settings. Not
   * persisted: it is a selection for the next Generate, not project state.
   */
  rerenderCombos: Set<string>;
  toggleComboRerender: (key: string) => void;
  /** Replaces both check sets at once, for check all / uncheck all. */
  setComboChecks: (checks: {
    excludedCombos?: Set<string>;
    rerenderCombos?: Set<string>;
  }) => void;

  jobs: StudioJob[];
  addJob: (job: StudioJob) => void;
  updateJob: (dreamUuid: string, updates: Partial<StudioJob>) => void;
  removeJob: (dreamUuid: string) => void;
  /**
   * Rendered clips taken out of the matrix, by discard or by a re-render
   * replacing them. Newest first. Each can be put back in its cell.
   */
  historyJobs: StudioJob[];
  /** Moves a job out of the matrix; a rendered one is kept in history. */
  archiveJob: (dreamUuid: string) => void;
  archiveJobs: (dreamUuids: readonly string[]) => void;
  /**
   * Puts a history clip back in its cell, archiving whatever the cell held.
   * Refuses while the cell is still rendering. Returns the displaced job, or
   * null if nothing was restored.
   */
  restoreJob: (
    dreamUuid: string,
  ) => { restored: StudioJob; displaced?: StudioJob } | null;

  newCompletedCount: number;
  incrementNewCompleted: () => void;
  clearNewCompleted: () => void;

  resetSession: () => void;
};

const DEFAULT_IMAGE_GEN_PARAMS: ImageGenParams = {
  model: "z-image-turbo",
  seedCount: 8,
  size: "1280*720",
  negativePrompt: "",
};
const DEFAULT_VIDEO_GEN_PARAMS: VideoGenParams = {
  model: "ltx-i2v",
  duration: 5,
  numInferenceSteps: 30,
  guidance: null,
  seed: -1,
};

export const HISTORY_LIMIT = 100;

/**
 * Adds the item `pick` names to a removed list, with its position, replacing
 * any earlier entry for the same item.
 */
const remember = <T>(
  removed: Removed<T>[],
  list: readonly T[],
  id: string,
  idOf: (item: T) => string,
): Removed<T>[] => {
  const index = list.findIndex((item) => idOf(item) === id);
  if (index < 0) return removed;
  return [
    ...removed.filter((r) => idOf(r.item) !== id),
    { item: list[index], index },
  ];
};

const keepIfUnchanged = <T>(previous: T[], next: T[]) =>
  next.length === previous.length ? previous : next;

const pruneRemovals = (
  historyJobs: readonly StudioJob[],
  removedImages: Removed<StudioImage>[],
  removedActions: Removed<StudioAction>[],
) => {
  const imageIds = new Set(historyJobs.map((job) => job.imageId));
  const actionIds = new Set(historyJobs.map((job) => job.actionId));
  return {
    removedImages: keepIfUnchanged(
      removedImages,
      removedImages.filter((r) => imageIds.has(r.item.uuid)),
    ),
    removedActions: keepIfUnchanged(
      removedActions,
      removedActions.filter((r) => actionIds.has(r.item.id)),
    ),
  };
};

const toHistoryEntry = (job: StudioJob): StudioJob => ({
  ...job,
  previewFrame: undefined,
  progress: undefined,
});

const insertAt = <T>(list: readonly T[], item: T, index: number) => [
  ...list.slice(0, index),
  item,
  ...list.slice(index),
];

export { comboKeyOf };

const pruneCombosForImage = (combos: Set<string>, imageUuid: string) => {
  const prefix = `${imageUuid}:`;
  const next = new Set<string>();
  for (const key of combos) {
    if (!key.startsWith(prefix)) next.add(key);
  }
  return next;
};

const pruneCombosForAction = (combos: Set<string>, actionId: string) => {
  const suffix = `:${actionId}`;
  const next = new Set<string>();
  for (const key of combos) {
    if (!key.endsWith(suffix)) next.add(key);
  }
  return next;
};

export const selectStudioProject = (state: StudioState) => ({
  activeTab: state.activeTab,
  imagePrompt: state.imagePrompt,
  styleReference: state.styleReference,
  imageGenParams: state.imageGenParams,
  images: state.images,
  actions: state.actions,
  videoGenParams: state.videoGenParams,
  outputPlaylistId: state.outputPlaylistId,
  excludedCombos: state.excludedCombos,
  jobs: state.jobs,
  historyJobs: state.historyJobs,
  removedImages: state.removedImages,
  removedActions: state.removedActions,
});

export const useStudioStore = create<StudioState>()((set, get) => ({
  activeTab: "images" as StudioTab,
  setActiveTab: (tab: StudioTab) => {
    if (tab === "generate") set({ newCompletedCount: 0 });
    set({ activeTab: tab });
  },

  imagePrompt: "",
  setImagePrompt: (prompt: string) => set({ imagePrompt: prompt }),
  styleReference: null,
  setStyleReference: (reference) => set({ styleReference: reference }),
  imageGenParams: DEFAULT_IMAGE_GEN_PARAMS,
  setImageGenParams: (params: Partial<ImageGenParams>) =>
    set((s) => ({ imageGenParams: { ...s.imageGenParams, ...params } })),
  images: [] as StudioImage[],
  removedImages: [] as Removed<StudioImage>[],
  removedActions: [] as Removed<StudioAction>[],
  addImage: (image: StudioImage) =>
    set((s) => ({ images: [...s.images, image] })),
  updateImage: (uuid: string, updates: Partial<StudioImage>) =>
    set((s) => ({
      images: s.images.map((img) =>
        img.uuid === uuid ? { ...img, ...updates } : img,
      ),
    })),
  removeImage: (uuid: string) =>
    set((s) => ({
      images: s.images.filter((img) => img.uuid !== uuid),
      ...pruneRemovals(
        s.historyJobs,
        remember(s.removedImages, s.images, uuid, (img) => img.uuid),
        s.removedActions,
      ),
      excludedCombos: pruneCombosForImage(s.excludedCombos, uuid),
      rerenderCombos: pruneCombosForImage(s.rerenderCombos, uuid),
    })),

  actions: [] as StudioAction[],
  addAction: (action: StudioAction) =>
    set((s) => ({ actions: [...s.actions, action] })),
  updateAction: (id: string, updates: Partial<StudioAction>) =>
    set((s) => ({
      actions: s.actions.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
  removeAction: (id: string) =>
    set((s) => ({
      actions: s.actions.filter((a) => a.id !== id),
      ...pruneRemovals(
        s.historyJobs,
        s.removedImages,
        remember(s.removedActions, s.actions, id, (a) => a.id),
      ),
      excludedCombos: pruneCombosForAction(s.excludedCombos, id),
      rerenderCombos: pruneCombosForAction(s.rerenderCombos, id),
    })),
  loadPresetPack: (newActions: StudioAction[]) =>
    set((s) => ({ actions: [...s.actions, ...newActions] })),

  videoGenParams: DEFAULT_VIDEO_GEN_PARAMS,
  setVideoGenParams: (params: Partial<VideoGenParams>) =>
    set((s) => {
      const videoGenParams = { ...s.videoGenParams, ...params };
      if (videoGenParams.model === s.videoGenParams.model) {
        return { videoGenParams };
      }
      return {
        videoGenParams,
        actions: retargetActionsLoras(s.actions, videoGenParams.model),
      };
    }),
  outputPlaylistId: null,
  setOutputPlaylistId: (id: string | null) => set({ outputPlaylistId: id }),

  excludedCombos: new Set<string>(),
  toggleComboExcluded: (key: string) =>
    set((s) => {
      const next = new Set(s.excludedCombos);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { excludedCombos: next };
    }),
  setComboExcluded: (key: string, excluded: boolean) =>
    set((s) => {
      if (s.excludedCombos.has(key) === excluded) return s;
      const next = new Set(s.excludedCombos);
      if (excluded) next.add(key);
      else next.delete(key);
      return { excludedCombos: next };
    }),
  rerenderCombos: new Set<string>(),
  toggleComboRerender: (key: string) =>
    set((s) => {
      const next = new Set(s.rerenderCombos);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { rerenderCombos: next };
    }),
  setComboChecks: (checks) => set(checks),

  jobs: [] as StudioJob[],
  addJob: (job: StudioJob) =>
    set((s) => {
      const key = comboKeyOf(job.imageId, job.actionId);
      if (!s.rerenderCombos.has(key)) return { jobs: [...s.jobs, job] };
      const rerenderCombos = new Set(s.rerenderCombos);
      rerenderCombos.delete(key);
      return { jobs: [...s.jobs, job], rerenderCombos };
    }),
  updateJob: (dreamUuid: string, updates: Partial<StudioJob>) =>
    set((s) => ({
      jobs: s.jobs.map((j) => {
        if (j.dreamUuid !== dreamUuid) return j;
        const merged = { ...j, ...updates };
        if (updates.status === "processing" && !j.startedAt) {
          merged.startedAt = Date.now();
        }
        if (updates.status === "processed" && !j.completedAt) {
          merged.completedAt = Date.now();
        }
        return merged;
      }),
    })),
  removeJob: (dreamUuid: string) =>
    set((s) => ({
      jobs: s.jobs.filter((j) => j.dreamUuid !== dreamUuid),
    })),
  historyJobs: [] as StudioJob[],
  archiveJob: (dreamUuid: string) => get().archiveJobs([dreamUuid]),
  archiveJobs: (dreamUuids: readonly string[]) =>
    set((s) => {
      const wanted = new Set(dreamUuids);
      const archived = s.jobs.filter((j) => wanted.has(j.dreamUuid));
      if (archived.length === 0) return s;
      const jobs = s.jobs.filter((j) => !wanted.has(j.dreamUuid));
      // Only a clip that rendered has anything to go back to.
      const rendered = archived
        .filter((j) => j.status === "processed")
        .map(toHistoryEntry)
        .reverse();
      if (rendered.length === 0) return { jobs };
      const renderedIds = new Set(rendered.map((j) => j.dreamUuid));
      const historyJobs = [
        ...rendered,
        ...s.historyJobs.filter((j) => !renderedIds.has(j.dreamUuid)),
      ].slice(0, HISTORY_LIMIT);
      return {
        jobs,
        historyJobs,
        ...pruneRemovals(historyJobs, s.removedImages, s.removedActions),
      };
    }),
  restoreJob: (dreamUuid: string) => {
    const s = get();
    const restored = s.historyJobs.find((j) => j.dreamUuid === dreamUuid);
    if (!restored) return null;
    const displaced = findCellJob(s.jobs, restored.imageId, restored.actionId);
    if (displaced && isJobInFlight(displaced)) return null;
    // A clip whose image or action has since been removed brings it back,
    // at the place it had.
    const imageGone = !s.images.some((i) => i.uuid === restored.imageId);
    const actionGone = !s.actions.some((a) => a.id === restored.actionId);
    const imageBack = imageGone
      ? s.removedImages.find((r) => r.item.uuid === restored.imageId)
      : undefined;
    const actionBack = actionGone
      ? s.removedActions.find((r) => r.item.id === restored.actionId)
      : undefined;
    const images = imageBack
      ? insertAt(s.images, imageBack.item, imageBack.index)
      : s.images;
    const actions = actionBack
      ? insertAt(s.actions, actionBack.item, actionBack.index)
      : s.actions;
    const key = comboKeyOf(restored.imageId, restored.actionId);
    // The row or column comes back holding just this clip; its empty cells
    // start unchecked rather than queued to generate.
    const excludedCombos = new Set(s.excludedCombos);
    if (imageBack || actionBack) {
      for (const image of images) {
        for (const action of actions) {
          const other = comboKeyOf(image.uuid, action.id);
          const returning =
            (imageBack && image.uuid === restored.imageId) ||
            (actionBack && action.id === restored.actionId);
          if (returning && other !== key) excludedCombos.add(other);
        }
      }
    }

    let historyJobs = s.historyJobs.filter((j) => j.dreamUuid !== dreamUuid);
    if (displaced?.status === "processed") {
      historyJobs = [toHistoryEntry(displaced), ...historyJobs].slice(
        0,
        HISTORY_LIMIT,
      );
    }
    const rerenderCombos = new Set(s.rerenderCombos);
    rerenderCombos.delete(key);
    set({
      images,
      actions,
      ...pruneRemovals(
        historyJobs,
        s.removedImages.filter((r) => r !== imageBack),
        s.removedActions.filter((r) => r !== actionBack),
      ),
      excludedCombos,
      jobs: [
        ...s.jobs.filter((j) => j.dreamUuid !== displaced?.dreamUuid),
        restored,
      ],
      historyJobs,
      rerenderCombos,
    });
    return { restored, displaced };
  },
  newCompletedCount: 0,
  incrementNewCompleted: () =>
    set((s) => ({ newCompletedCount: s.newCompletedCount + 1 })),
  clearNewCompleted: () => set({ newCompletedCount: 0 }),

  resetSession: () =>
    set({
      activeTab: "images" as StudioTab,
      imagePrompt: "",
      styleReference: null,
      imageGenParams: DEFAULT_IMAGE_GEN_PARAMS,
      images: [],
      actions: [],
      videoGenParams: DEFAULT_VIDEO_GEN_PARAMS,
      outputPlaylistId: null,
      excludedCombos: new Set<string>(),
      rerenderCombos: new Set<string>(),
      jobs: [],
      historyJobs: [],
      removedImages: [],
      removedActions: [],
      newCompletedCount: 0,
    }),
}));

export default useStudioStore;
