import type { VideoModel, LoRAConfig } from "@/types/studio.types";

export type StudioMode = "flow" | "batch";

export interface FlowKeyframe {
  id: string; // local UUID for drag/drop identity
  // Backend Keyframe.uuid — only present when the frame was added from a
  // playlist (playlist items reference a Keyframe entity). Uploaded frames
  // are saved as image-type Dreams instead and have no Keyframe row.
  keyframeUuid?: string;
  // Source image Dream UUID. Set for uploaded frames and for playlist frames
  // whose Keyframe has an associated image Dream.
  dreamUuid?: string;
  imageUrl: string; // presigned URL or local objectURL while uploading
  name: string; // display name
  isLoopKeyframe?: boolean; // true for auto-generated loop frame

  // Local-only upload state — never persisted to backend.
  uploadStatus?: "uploading" | "failed";
  uploadProgress?: number; // 0-100
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
  numInferenceStepsOverride?: number;
  guidanceOverride?: number;
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
