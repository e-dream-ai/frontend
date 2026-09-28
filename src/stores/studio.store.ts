import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  reconcileActionLoras,
  retargetActionsLoras,
} from "@/components/pages/studio/constants/lora-options";
import type {
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
  // Deliberately unset: the model catalog decides. A number here is a second,
  // competing default that silently outranks the model's own — which is how
  // every new project started LTX at the bottom of its range while the catalog
  // said otherwise. The guidance helpers already read a non-finite value as
  // "use constraint.default", and JSON round-trips it to null, which is still
  // non-finite, so a rehydrated session stays unset too.
  guidance: Number.NaN,
  seed: -1,
};

/** Something taken out of a list, and the position it had there. */
export interface Removed<T> {
  item: T;
  index: number;
}

/**
 * Adds the item `pick` names to a removed list, with its position, replacing
 * any earlier entry for the same item.
 */
const remember = <T>(
  removed: readonly Removed<T>[],
  list: readonly T[],
  pick: (item: T) => string | undefined,
): Removed<T>[] => {
  const index = list.findIndex((item) => pick(item) !== undefined);
  if (index < 0) return [...removed];
  const id = pick(list[index]);
  return [
    ...removed.filter((r) => pick(r.item) !== id),
    { item: list[index], index },
  ];
};

const insertAt = <T>(list: readonly T[], item: T, index: number) => [
  ...list.slice(0, index),
  item,
  ...list.slice(index),
];

export const comboKeyOf = (imageUuid: string, actionId: string) =>
  `${imageUuid}:${actionId}`;

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

export const studioPartialize = (state: StudioState) => ({
  activeTab: state.activeTab,
  imagePrompt: state.imagePrompt,
  styleReference: state.styleReference,
  imageGenParams: state.imageGenParams,
  images: state.images.map((img) => ({
    ...img,
    previewFrame: undefined,
  })),
  actions: state.actions,
  videoGenParams: state.videoGenParams,
  outputPlaylistId: state.outputPlaylistId,
  excludedCombos: [...(state.excludedCombos as Set<string>)],
  jobs: state.jobs.map((j) => ({ ...j, previewFrame: undefined })),
  historyJobs: state.historyJobs.map((j) => ({
    ...j,
    previewFrame: undefined,
  })),
  removedImages: state.removedImages,
  removedActions: state.removedActions,
});

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
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
          removedImages: remember(s.removedImages, s.images, (img) =>
            img.uuid === uuid ? uuid : undefined,
          ),
          excludedCombos: pruneCombosForImage(s.excludedCombos, uuid),
          rerenderCombos: pruneCombosForImage(s.rerenderCombos, uuid),
        })),

      actions: [] as StudioAction[],
      addAction: (action: StudioAction) =>
        set((s) => ({ actions: [...s.actions, action] })),
      updateAction: (id: string, updates: Partial<StudioAction>) =>
        set((s) => ({
          actions: s.actions.map((a) =>
            a.id === id ? { ...a, ...updates } : a,
          ),
        })),
      removeAction: (id: string) =>
        set((s) => ({
          actions: s.actions.filter((a) => a.id !== id),
          removedActions: remember(s.removedActions, s.actions, (a) =>
            a.id === id ? id : undefined,
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
      archiveJob: (dreamUuid: string) =>
        set((s) => {
          const job = s.jobs.find((j) => j.dreamUuid === dreamUuid);
          if (!job) return s;
          const jobs = s.jobs.filter((j) => j.dreamUuid !== dreamUuid);
          // Only a clip that rendered has anything to go back to.
          if (job.status !== "processed") return { jobs };
          return {
            jobs,
            historyJobs: [
              { ...job, previewFrame: undefined, progress: undefined },
              ...s.historyJobs.filter((j) => j.dreamUuid !== dreamUuid),
            ],
          };
        }),
      restoreJob: (dreamUuid: string) => {
        const s = get();
        const restored = s.historyJobs.find((j) => j.dreamUuid === dreamUuid);
        if (!restored) return null;
        const displaced = s.jobs.find(
          (j) =>
            j.imageId === restored.imageId &&
            j.actionId === restored.actionId &&
            j.jobType !== "uprez",
        );
        if (
          displaced &&
          (displaced.status === "queue" || displaced.status === "processing")
        ) {
          return null;
        }
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

        let historyJobs = s.historyJobs.filter(
          (j) => j.dreamUuid !== dreamUuid,
        );
        if (displaced?.status === "processed") {
          historyJobs = [
            { ...displaced, previewFrame: undefined, progress: undefined },
            ...historyJobs,
          ];
        }
        const rerenderCombos = new Set(s.rerenderCombos);
        rerenderCombos.delete(key);
        set({
          images,
          actions,
          removedImages: s.removedImages.filter((r) => r !== imageBack),
          removedActions: s.removedActions.filter((r) => r !== actionBack),
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
    }),
    {
      name: "studio-session",
      version: 11,
      partialize: studioPartialize,
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);
          if (!raw) return null;
          const parsed = JSON.parse(raw);
          if (parsed?.state?.excludedCombos) {
            parsed.state.excludedCombos = new Set(parsed.state.excludedCombos);
          }
          return parsed;
        },
        setItem: (name, value) => {
          const serializable = {
            ...value,
            state: {
              ...value.state,
              excludedCombos: Array.isArray(value.state.excludedCombos)
                ? value.state.excludedCombos
                : value.state.excludedCombos
                  ? [...(value.state.excludedCombos as Set<string>)]
                  : [],
            },
          };
          localStorage.setItem(name, JSON.stringify(serializable));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          // Add jobType to any persisted jobs missing it
          if (state.jobs) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            state.jobs = (state.jobs as Array<any>).map((j) => ({
              ...j,
              jobType:
                j.jobType ??
                (j.actionId?.startsWith("uprez-") ? "uprez" : "wan-i2v"),
            }));
          }
        }
        if (version < 3) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const qp = state.qwenParams as any;
          if (qp) {
            state.imageGenParams = { ...DEFAULT_IMAGE_GEN_PARAMS, ...qp };
            delete state.qwenParams;
          } else {
            state.imageGenParams = { ...DEFAULT_IMAGE_GEN_PARAMS };
          }
        }
        if (version < 4) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const wp = state.wanParams as any;
          if (wp) {
            state.videoGenParams = { ...DEFAULT_VIDEO_GEN_PARAMS, ...wp };
            delete state.wanParams;
          } else {
            state.videoGenParams = { ...DEFAULT_VIDEO_GEN_PARAMS };
          }
        }
        if (version < 5) {
          // Migrate untouched legacy defaults to the new studio defaults.
          // Preserve any explicit user choices that differ from the old defaults.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const imageGenParams = state.imageGenParams as any;
          if (
            imageGenParams?.model === "qwen-image" &&
            imageGenParams?.seedCount === 8 &&
            imageGenParams?.size === "1280*720"
          ) {
            state.imageGenParams = { ...DEFAULT_IMAGE_GEN_PARAMS };
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const videoGenParams = state.videoGenParams as any;
          if (
            videoGenParams?.model === "wan-i2v" &&
            videoGenParams?.duration === 5 &&
            videoGenParams?.numInferenceSteps === 30 &&
            videoGenParams?.guidance === 5.0
          ) {
            state.videoGenParams = { ...DEFAULT_VIDEO_GEN_PARAMS };
          }
        }
        if (version < 6) {
          // negativePrompt added to image generation (#699); backfill so the
          // controlled textarea always has a string.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const imageGenParams = state.imageGenParams as any;
          if (imageGenParams && imageGenParams.negativePrompt == null) {
            imageGenParams.negativePrompt = "";
          }
        }
        if (version < 7) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const videoGenParams = state.videoGenParams as any;
          if (videoGenParams?.model === "ltx-i2v") {
            videoGenParams.guidance = DEFAULT_VIDEO_GEN_PARAMS.guidance;
          }
        }
        if (version < 8) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const videoGenParams = state.videoGenParams as any;
          if (videoGenParams && videoGenParams.seed == null) {
            videoGenParams.seed = DEFAULT_VIDEO_GEN_PARAMS.seed;
          }
        }
        if (version < 9) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const model = (state.videoGenParams as any)?.model;
          if (Array.isArray(state.actions) && model) {
            state.actions = reconcileActionLoras(
              state.actions as StudioAction[],
              model,
            );
          }
        }
        if (version < 10) {
          if (Array.isArray(state.images)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const img of state.images as any[]) delete img.selected;
          }
          if (Array.isArray(state.actions)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const a of state.actions as any[]) delete a.enabled;
          }
        }
        if (version < 11) {
          // The Results tab was folded into Generate, which is now the results
          // matrix. `activeTab` is persisted, so anyone whose last session
          // ended on Results would otherwise reopen the studio to a blank
          // frame: no tab matches and nothing renders.
          if (state.activeTab === "results") state.activeTab = "generate";
        }
        return state as Record<string, unknown>;
      },
    },
  ),
);

export default useStudioStore;
