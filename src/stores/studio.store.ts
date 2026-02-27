import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  StudioTab,
  StudioImage,
  StudioAction,
  StudioJob,
  QwenParams,
  WanI2VParams,
} from "@/types/studio.types";

type StudioState = {
  activeTab: StudioTab;
  setActiveTab: (tab: StudioTab) => void;

  imagePrompt: string;
  setImagePrompt: (prompt: string) => void;
  qwenParams: QwenParams;
  setQwenParams: (params: Partial<QwenParams>) => void;
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

  wanParams: WanI2VParams;
  setWanParams: (params: Partial<WanI2VParams>) => void;
  outputPlaylistId: string | null;
  setOutputPlaylistId: (id: string | null) => void;
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

const DEFAULT_QWEN_PARAMS: QwenParams = { seedCount: 8, size: "1280*720" };
const DEFAULT_WAN_PARAMS: WanI2VParams = {
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
      qwenParams: DEFAULT_QWEN_PARAMS,
      setQwenParams: (params: Partial<QwenParams>) =>
        set((s) => ({ qwenParams: { ...s.qwenParams, ...params } })),
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

      wanParams: DEFAULT_WAN_PARAMS,
      setWanParams: (params: Partial<WanI2VParams>) =>
        set((s) => ({ wanParams: { ...s.wanParams, ...params } })),
      outputPlaylistId: null,
      setOutputPlaylistId: (id: string | null) => set({ outputPlaylistId: id }),
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
            j.status === "processed" && j.jobType !== "uprez" && !j.uprezed
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
          qwenParams: DEFAULT_QWEN_PARAMS,
          images: [],
          actions: [],
          wanParams: DEFAULT_WAN_PARAMS,
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
      version: 2,
      partialize: (state) => ({
        activeTab: state.activeTab,
        imagePrompt: state.imagePrompt,
        qwenParams: state.qwenParams,
        images: state.images.map((img) => ({
          ...img,
          previewFrame: undefined,
        })),
        actions: state.actions,
        wanParams: state.wanParams,
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
        return state as Record<string, unknown>;
      },
    },
  ),
);

export default useStudioStore;
