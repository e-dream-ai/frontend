import type { VideoModel, LoRAConfig } from "@/types/studio.types";
import type { CropRegion } from "@/utils/aspect-crop";

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

  // Source image pixel dimensions, captured on <img> load. Used to compute a
  // default center crop and to render the crop honestly in the strip.
  naturalWidth?: number;
  naturalHeight?: number;
  // User-selected crop region (normalized to the source image), aspect-locked
  // to the flow's output ratio. Undefined = fall back to a center crop.
  crop?: CropRegion;
  // Cache of the cropped-and-reuploaded image Dream used for generation, plus
  // the signature that produced it (source uuid + crop + ratio). When the
  // signature still matches, generation reuses this instead of re-uploading.
  croppedDreamUuid?: string;
  croppedSignature?: string;

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
  negativePromptOverride?: string;
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
