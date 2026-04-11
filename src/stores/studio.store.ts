import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  StudioTab,
  StudioImage,
  StudioAction,
  StudioJob,
  ImageGenParams,
  VideoGenParams,
  UprezModel,
} from "@/types/studio.types";

type StudioState = {
  activeTab: StudioTab;
  setActiveTab: (tab: StudioTab) => void;

  imagePrompt: string;
  setImagePrompt: (prompt: string) => void;
  imageGenParams: ImageGenParams;
  setImageGenParams: (params: Partial<ImageGenParams>) => void;
  images: StudioImage[];
  addImage: (image: StudioImage) => void;
  updateImage: (uuid: string, updates: Partial<StudioImage>) => void;
  toggleImageSelected: (uuid: string) => void;
  selectAllImages: () => void;
  deselectAllImages: () => void;
  removeImage: (uuid: string) => void;

  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;

  actions: StudioAction[];
  addAction: (action: StudioAction) => void;
  updateAction: (id: string, updates: Partial<StudioAction>) => void;
  removeAction: (id: string) => void;
  toggleActionEnabled: (id: string) => void;
  loadPresetPack: (actions: StudioAction[]) => void;

  videoGenParams: VideoGenParams;
  setVideoGenParams: (params: Partial<VideoGenParams>) => void;
  outputPlaylistId: string | null;
  setOutputPlaylistId: (id: string | null) => void;
  uprezModel: UprezModel;
  setUprezModel: (model: UprezModel) => void;
  uprezPlaylistId: string | null;
  setUprezPlaylistId: (id: string | null) => void;

  excludedCombos: Set<string>;
  toggleComboExcluded: (key: string) => void;

  jobs: StudioJob[];
  addJob: (job: StudioJob) => void;
  updateJob: (dreamUuid: string, updates: Partial<StudioJob>) => void;
  removeJob: (dreamUuid: string) => void;
  toggleJobUprez: (dreamUuid: string) => void;
  selectAllJobsForUprez: () => void;
  deselectAllJobsForUprez: () => void;

  newCompletedCount: number;
  incrementNewCompleted: () => void;
  clearNewCompleted: () => void;

  resetSession: () => void;
};

const DEFAULT_IMAGE_GEN_PARAMS: ImageGenParams = {
  model: "z-image-turbo",
  seedCount: 8,
  size: "1280*720",
};
const DEFAULT_VIDEO_GEN_PARAMS: VideoGenParams = {
  model: "ltx-i2v",
  duration: 5,
  numInferenceSteps: 30,
  guidance: 5.0,
};

export const useStudioStore = create<StudioState>()(
  persist(
    (set) => ({
      activeTab: "images" as StudioTab,
      setActiveTab: (tab: StudioTab) => {
        if (tab === "results") set({ newCompletedCount: 0 });
        set({ activeTab: tab });
      },

      imagePrompt: "",
      setImagePrompt: (prompt: string) => set({ imagePrompt: prompt }),
      imageGenParams: DEFAULT_IMAGE_GEN_PARAMS,
      setImageGenParams: (params: Partial<ImageGenParams>) =>
        set((s) => ({ imageGenParams: { ...s.imageGenParams, ...params } })),
      images: [] as StudioImage[],
      addImage: (image: StudioImage) =>
        set((s) => ({ images: [...s.images, image] })),
      updateImage: (uuid: string, updates: Partial<StudioImage>) =>
        set((s) => ({
          images: s.images.map((img) =>
            img.uuid === uuid ? { ...img, ...updates } : img,
          ),
        })),
      toggleImageSelected: (uuid: string) =>
        set((s) => ({
          images: s.images.map((img) =>
            img.uuid === uuid ? { ...img, selected: !img.selected } : img,
          ),
        })),
      selectAllImages: () =>
        set((s) => ({
          images: s.images.map((img) =>
            img.status === "processed" ? { ...img, selected: true } : img,
          ),
        })),
      deselectAllImages: () =>
        set((s) => ({
          images: s.images.map((img) => ({ ...img, selected: false })),
        })),
      removeImage: (uuid: string) =>
        set((s) => ({ images: s.images.filter((img) => img.uuid !== uuid) })),

      isGenerating: false,
      setIsGenerating: (v: boolean) => set({ isGenerating: v }),

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
        set((s) => ({ actions: s.actions.filter((a) => a.id !== id) })),
      toggleActionEnabled: (id: string) =>
        set((s) => ({
          actions: s.actions.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled } : a,
          ),
        })),
      loadPresetPack: (newActions: StudioAction[]) =>
        set((s) => ({ actions: [...s.actions, ...newActions] })),

      videoGenParams: DEFAULT_VIDEO_GEN_PARAMS,
      setVideoGenParams: (params: Partial<VideoGenParams>) =>
        set((s) => ({ videoGenParams: { ...s.videoGenParams, ...params } })),
      outputPlaylistId: null,
      setOutputPlaylistId: (id: string | null) => set({ outputPlaylistId: id }),
      uprezModel: "uprez" as UprezModel,
      setUprezModel: (model: UprezModel) => set({ uprezModel: model }),
      uprezPlaylistId: null,
      setUprezPlaylistId: (id: string | null) => set({ uprezPlaylistId: id }),

      excludedCombos: new Set<string>(),
      toggleComboExcluded: (key: string) =>
        set((s) => {
          const next = new Set(s.excludedCombos);
          if (next.has(key)) next.delete(key);
          else next.add(key);
          return { excludedCombos: next };
        }),

      jobs: [] as StudioJob[],
      addJob: (job: StudioJob) => set((s) => ({ jobs: [...s.jobs, job] })),
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
      toggleJobUprez: (dreamUuid: string) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.dreamUuid === dreamUuid
              ? { ...j, selectedForUprez: !j.selectedForUprez }
              : j,
          ),
        })),
      selectAllJobsForUprez: () =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.status === "processed" &&
            j.jobType !== "uprez" &&
            j.jobType !== "nvidia-uprez" &&
            !j.uprezed
              ? { ...j, selectedForUprez: true }
              : j,
          ),
        })),
      deselectAllJobsForUprez: () =>
        set((s) => ({
          jobs: s.jobs.map((j) => ({ ...j, selectedForUprez: false })),
        })),

      newCompletedCount: 0,
      incrementNewCompleted: () =>
        set((s) => ({ newCompletedCount: s.newCompletedCount + 1 })),
      clearNewCompleted: () => set({ newCompletedCount: 0 }),

      resetSession: () =>
        set({
          activeTab: "images" as StudioTab,
          imagePrompt: "",
          imageGenParams: DEFAULT_IMAGE_GEN_PARAMS,
          images: [],
          actions: [],
          videoGenParams: DEFAULT_VIDEO_GEN_PARAMS,
          uprezModel: "uprez" as UprezModel,
          outputPlaylistId: null,
          uprezPlaylistId: null,
          excludedCombos: new Set<string>(),
          jobs: [],
          newCompletedCount: 0,
          isGenerating: false,
        }),
    }),
    {
      name: "studio-session",
      version: 5,
      partialize: (state) => ({
        activeTab: state.activeTab,
        imagePrompt: state.imagePrompt,
        imageGenParams: state.imageGenParams,
        images: state.images.map((img) => ({
          ...img,
          previewFrame: undefined,
        })),
        actions: state.actions,
        videoGenParams: state.videoGenParams,
        uprezModel: state.uprezModel,
        outputPlaylistId: state.outputPlaylistId,
        uprezPlaylistId: state.uprezPlaylistId,
        excludedCombos: [...(state.excludedCombos as Set<string>)],
        jobs: state.jobs.map((j) => ({ ...j, previewFrame: undefined })),
        // Intentionally excluded: newCompletedCount, isGenerating
      }),
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
        return state as Record<string, unknown>;
      },
    },
  ),
);

export default useStudioStore;
