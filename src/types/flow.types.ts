import type { VideoModel, LoRAConfig } from "@/types/studio.types";

export type StudioMode = "flow" | "batch";

export interface FlowKeyframe {
  id: string; // local UUID for drag/drop identity
  keyframeUuid: string; // backend Keyframe.uuid
  imageUrl: string; // presigned URL for display
  name: string; // display name
  isLoopKeyframe?: boolean; // true for auto-generated loop frame
}

export interface FlowState {
  keyframes: FlowKeyframe[]; // ordered list (excludes loop keyframe — derived)
  loop: boolean;
}

export type TransitionStatus =
  | "idle"
  | "queue"
  | "processing"
  | "processed"
  | "failed";

export interface FlowTransition {
  fromKeyframeId: string; // FlowKeyframe.id
  toKeyframeId: string; // FlowKeyframe.id

  // Per-transition overrides (undefined = use global)
  presetOverride?: string; // PresetPack name
  promptOverride?: string;
  durationOverride?: number; // seconds
  modelOverride?: VideoModel;
  loraOverride?: LoRAConfig[];

  // Generation state
  dreamUuid?: string;
  status: TransitionStatus;
  progress?: number; // 0-100

  // Uprez state (undefined = not started)
  uprezDreamUuid?: string;
  uprezStatus?: "queue" | "processing" | "processed" | "failed";
  uprezProgress?: number;
}
