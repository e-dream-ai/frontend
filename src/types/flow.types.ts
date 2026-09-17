import type { VideoModel, LoRAConfig } from "@/types/studio.types";

export type StudioMode = "flow" | "action" | "uprez";

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

/**
 * Everything one transition renders with.
 *
 * Complete by construction: every field is required and nothing resolves at
 * read time, so what the panel shows is what gets sent to the model. This
 * replaced a chain of `transitionOverride ?? global ?? preset`, where
 * `undefined` meant "inherit" and a transition's real settings existed only
 * after resolution — which is what let editing a global quietly restale a
 * batch of finished renders.
 *
 * Both LoRA sets are stored. They used to be split: the high-noise set was the
 * stored value and the low-noise set was recovered by matching it back to the
 * preset it came from, so a LoRA's other half existed only as a lookup.
 */
export interface TransitionSettings {
  prompt: string;
  negativePrompt: string;
  duration: number;
  model: VideoModel;
  steps: number;
  guidance: number;
  seed: number;
  highNoiseLoras: LoRAConfig[];
  lowNoiseLoras: LoRAConfig[];
}

/** One completed (or in-flight) generation for a transition position. */
export interface TransitionHistoryEntry {
  dreamUuid: string;
  createdAt: number; // epoch ms
  // Set once the run reaches "processed". Only completed runs are offered in
  // the history strip — a failed or in-flight dream has nothing to show.
  completed?: boolean;
  settings: TransitionSettings;
}

export interface FlowTransition {
  fromFrameId: string; // FlowReferenceFrame.id
  toFrameId: string; // FlowReferenceFrame.id

  // What this transition renders with. Always complete — a new transition is
  // seeded by copying its predecessor (or DEFAULT_TRANSITION_SETTINGS for the
  // first), and after that it is independent of every other transition.
  settings: TransitionSettings;

  // Generation state
  dreamUuid?: string;
  status: TransitionStatus;
  progress?: number; // 0-100

  // Every generation run at this position, oldest first. The entry matching
  // `dreamUuid` is the one currently in the flow; the rest are restorable.
  history?: TransitionHistoryEntry[];

  // Uprez state (undefined = not started)
  uprezDreamUuid?: string;
  uprezStatus?: "queue" | "processing" | "processed" | "failed";
  uprezProgress?: number;
}
