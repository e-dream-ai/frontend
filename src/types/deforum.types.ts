/** One prompt keyframe: the text deforum switches to at `frame`. */
export interface DeforumPrompt {
  /** Local id for React keys — frames can be edited, so they can't be keys. */
  id: string;
  frame: number;
  text: string;
}

export type DeforumAnimationMode = "2D" | "3D";

/**
 * Everything one deforum animation renders with. Complete by construction,
 * like a flow transition's settings: what the panel shows is what is sent.
 *
 * The motion fields are deforum schedule strings (`"0: (1.025), 120: (1.0)"`).
 * Their frame keys are scaled along with the prompts for a test render.
 */
export interface DeforumSettings {
  prompts: DeforumPrompt[];
  negativePrompt: string;
  maxFrames: number;
  width: number;
  height: number;
  /** -1 picks a new seed every render. */
  seed: number;
  steps: number;
  sampler: string;
  scheduler: string;
  animationMode: DeforumAnimationMode;
  border: "replicate" | "wrap";
  zoom: string;
  angle: string;
  translationX: string;
  translationY: string;
  translationZ: string;
  rotation3dX: string;
  rotation3dY: string;
  rotation3dZ: string;
  strengthSchedule: string;
  cfgScaleSchedule: string;
}

export type DeforumRenderKind = "test" | "final";

export type DeforumRenderStatus =
  | "queue"
  | "processing"
  | "processed"
  | "failed";

/** The latest render of one kind for a clip. */
export interface DeforumRender {
  dreamUuid: string;
  status: DeforumRenderStatus;
  progress?: number;
  createdAt: number;
  /** The settings it was rendered with, to tell when the clip has moved on. */
  settings: DeforumSettings;
}

export interface DeforumClip {
  id: string;
  name: string;
  settings: DeforumSettings;
  test?: DeforumRender;
  final?: DeforumRender;
}
