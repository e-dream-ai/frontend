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
