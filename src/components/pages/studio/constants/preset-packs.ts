import type { StudioAction } from "@/types/studio.types";
import { v4 as uuidv4 } from "uuid";

export const PRESET_GROUPS = [
  { id: "transformations", label: "Transformations" },
  { id: "camera", label: "Camera" },
] as const;

export type PresetGroup = (typeof PRESET_GROUPS)[number]["id"];

/**
 * The camera motion a LoRA produces, shared across models so a pick can follow
 * the model dropdown: LTX's Dolly In and Wan's Zoom In are the same move.
 */
export type CameraMove =
  | "static"
  | "push-in"
  | "pull-out"
  | "left"
  | "right"
  | "up"
  | "down"
  | "orbit";

export interface PresetAction extends Omit<StudioAction, "id"> {
  loraLabel?: string;
  cameraMove?: CameraMove;
}

export interface PresetPack {
  name: string;
  model: "wan-i2v" | "ltx-i2v" | "all";
  group: PresetGroup;
  actions: PresetAction[];
}

export const createActionsFromPreset = (preset: PresetPack): StudioAction[] =>
  preset.actions.map(
    ({
      prompt,
      negativePrompt,
      highNoiseLoras,
      lowNoiseLoras,
    }): StudioAction => ({
      id: uuidv4(),
      prompt,
      negativePrompt,
      highNoiseLoras,
      lowNoiseLoras,
    }),
  );
