import type { FlowReferenceFrame, FlowTransition } from "@/types/flow.types";
import { DEFAULT_TRANSITION_SETTINGS } from "../constants/default-transition-settings";
import type { StudioImage, StudioJob } from "@/types/studio.types";

export const EDITOR_STATE_SCHEMA_VERSION = 1;

export type PersistedReferenceFrame = Omit<
  FlowReferenceFrame,
  "imageUrl" | "uploadStatus" | "uploadProgress"
>;

export type PersistedTransition = Omit<FlowTransition, "progress">;

export type PersistedFlowState = Record<string, unknown> & {
  referenceFrames: PersistedReferenceFrame[];
  transitions: Record<string, PersistedTransition>;
};

export type RestoredFlowState = Record<string, unknown> & {
  referenceFrames: FlowReferenceFrame[];
  transitions: FlowTransition[];
};

export const transitionKey = (fromFrameId: string, toFrameId: string): string =>
  `${fromFrameId}::${toFrameId}`;

type FlowStateInput = Record<string, unknown> & {
  referenceFrames?: FlowReferenceFrame[];
  transitions?: FlowTransition[];
};

const omit = <T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): Omit<T, K> => {
  const clone = { ...source };
  for (const key of keys) {
    delete clone[key];
  }
  return clone;
};

const VOLATILE_FRAME_KEYS = [
  "imageUrl",
  "uploadStatus",
  "uploadProgress",
] as const;

const VOLATILE_TRANSITION_KEYS = ["progress"] as const;

const VOLATILE_IMAGE_KEYS = ["url", "previewFrame", "progress"] as const;

const VOLATILE_JOB_KEYS = [
  "previewFrame",
  "progress",
  "ingesting",
  "thumbnailUrl",
] as const;

const stripFrame = (frame: FlowReferenceFrame): PersistedReferenceFrame =>
  omit(frame, VOLATILE_FRAME_KEYS);

const stripTransition = (transition: FlowTransition): PersistedTransition =>
  omit(transition, VOLATILE_TRANSITION_KEYS);

export const toPersistedFlowState = (
  state: FlowStateInput,
): PersistedFlowState => {
  const { referenceFrames = [], transitions = [], ...rest } = state;

  const keyed: Record<string, PersistedTransition> = {};
  for (const transition of transitions) {
    keyed[transitionKey(transition.fromFrameId, transition.toFrameId)] =
      stripTransition(transition);
  }

  return {
    ...rest,
    referenceFrames: referenceFrames.map(stripFrame),
    transitions: keyed,
  };
};

export const fromPersistedFlowState = (
  persisted: PersistedFlowState,
): RestoredFlowState => {
  const { referenceFrames = [], transitions = {}, ...rest } = persisted;

  const ordered: FlowTransition[] = [];
  for (let i = 0; i < referenceFrames.length - 1; i += 1) {
    const fromFrameId = referenceFrames[i].id;
    const toFrameId = referenceFrames[i + 1].id;
    const stored = transitions[transitionKey(fromFrameId, toFrameId)];

    if (stored) {
      ordered.push({ ...stored });
      continue;
    }

    // Settings live on the transition now, so a gap the snapshot has no entry
    // for cannot be left without them. Same rule the store uses when a new pair
    // appears: copy the transition before it, and only reach for the built-in
    // default at the head of the flow.
    const before = ordered[ordered.length - 1];
    ordered.push({
      fromFrameId,
      toFrameId,
      status: "idle" as const,
      settings: { ...(before?.settings ?? DEFAULT_TRANSITION_SETTINGS) },
    });
  }

  return {
    ...rest,
    referenceFrames: referenceFrames.map((frame) => ({
      ...frame,
      imageUrl: "",
    })),
    transitions: ordered,
  };
};

type ActionStateInput = Record<string, unknown> & {
  excludedCombos?: Set<string> | string[];
  images?: StudioImage[];
  jobs?: StudioJob[];
};

export type PersistedActionState = Record<string, unknown> & {
  excludedCombos: string[];
  images: Omit<StudioImage, "url" | "previewFrame" | "progress">[];
  jobs: Omit<StudioJob, "previewFrame" | "progress" | "thumbnailUrl">[];
};

export const toPersistedActionState = (
  state: ActionStateInput,
): PersistedActionState => {
  const { excludedCombos, images = [], jobs = [], ...rest } = state;

  return {
    ...rest,
    excludedCombos: Array.isArray(excludedCombos)
      ? [...excludedCombos]
      : [...(excludedCombos ?? [])],
    images: images.map((image) => omit(image, VOLATILE_IMAGE_KEYS)),
    jobs: jobs.map((job) => omit(job, VOLATILE_JOB_KEYS)),
  };
};

export const fromPersistedActionState = (
  persisted: PersistedActionState,
): Record<string, unknown> & { excludedCombos: Set<string> } => {
  const { excludedCombos = [], images = [], ...rest } = persisted;

  return {
    ...rest,
    excludedCombos: new Set(excludedCombos),
    images: images.map((image) => ({ ...image, url: "" })),
  };
};
