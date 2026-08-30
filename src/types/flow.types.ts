import type { VideoModel, LoRAConfig } from "@/types/studio.types";

export type StudioMode = "flow" | "action";

export interface FlowReferenceFrame {
  id: string; // local UUID for drag/drop identity
  // Backend Keyframe.uuid — assigned by ensureFlowKeyframe when the flow is
  // saved to a playlist. Frames are not added as Keyframe entities: those rows
  // carry no image, so they can't be browsed or displayed (see #716).
  keyframeUuid?: string;
  // Source image Dream UUID. Set for uploaded frames and for frames picked
  // from the image library or a playlist — every path adds image Dreams.
  dreamUuid?: string;
  imageUrl: string; // presigned URL or local objectURL while uploading
  name: string; // display name
  isLoopFrame?: boolean; // true for auto-generated loop frame

  // Source image pixel dimensions, captured from the <img> once it loads.
  // Used to render each frame at its true shape and to detect transitions
  // that join two different shapes. Undefined until the image has loaded.
  naturalWidth?: number;
  naturalHeight?: number;

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
  fromFrameId: string; // FlowReferenceFrame.id
  toFrameId: string; // FlowReferenceFrame.id

  // Per-transition overrides (undefined = use global)
  presetOverride?: string; // PresetPack name
  promptOverride?: string;
  negativePromptOverride?: string;
  durationOverride?: number; // seconds
  modelOverride?: VideoModel;
  numInferenceStepsOverride?: number;
  guidanceOverride?: number;
  seedOverride?: number;
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
