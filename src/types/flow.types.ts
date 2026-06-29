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

  // i2i staging — a pending image-to-image variation candidate. Candidates are
  // a staging area: they render as cards but are EXCLUDED from transition
  // derivation (and therefore from generation) until the user accepts one.
  i2iCandidate?: boolean;
  i2iParentId?: string; // FlowKeyframe.id this candidate was varied from
  // Generation status of a candidate's own i2i/t2i dream. While "queue"/
  // "processing" the card shows the parent's source image as a placeholder;
  // job progress swaps in this candidate's distinct result once "processed".
  i2iStatus?: "queue" | "processing" | "processed" | "failed";

  // Local-only upload state — never persisted to backend.
  uploadStatus?: "uploading" | "failed";
  uploadProgress?: number; // 0-100

  // Variation candidates for this keyframe
  variations?: VariationCandidate[];
  activeVariationId?: string;
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

  // Variation candidates for this transition
  variations?: VariationCandidate[];
  activeVariationId?: string;
}

export interface VariationCandidate {
  id: string;
  method: "seed" | "expansion" | "i2i";
  prompt?: string;
  seed?: number;
  dreamUuid?: string;
  imageUrl?: string;
  status: TransitionStatus;
  progress?: number;
}
