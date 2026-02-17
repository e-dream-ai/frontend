import type { StudioAction } from "@/types/studio.types";
import { v4 as uuidv4 } from "uuid";

export interface PresetPack {
  name: string;
  actions: Omit<StudioAction, "id">[];
}

export const ACTION_PRESETS: PresetPack[] = [
  {
    name: "Camera Basics",
    actions: [
      { prompt: "slow zoom in, camera gently pushing forward", enabled: true },
      { prompt: "slow zoom out, camera pulling back to reveal", enabled: true },
      { prompt: "pan left to right, smooth motion", enabled: true },
      { prompt: "pan right to left, smooth motion", enabled: true },
      { prompt: "pan upward, revealing sky", enabled: true },
      { prompt: "pan downward, descending", enabled: true },
      { prompt: "push in, dramatic approach", enabled: true },
      { prompt: "pull out, widening perspective", enabled: true },
    ],
  },
  {
    name: "Cinematic",
    actions: [
      { prompt: "dolly forward, smooth cinematic approach", enabled: true },
      {
        prompt: "orbit around subject, 180 degrees, smooth motion",
        enabled: true,
      },
      { prompt: "crane up, rising above the scene", enabled: true },
      {
        prompt: "tracking shot, following motion left to right",
        enabled: true,
      },
      { prompt: "rack focus, shifting depth of field", enabled: true },
    ],
  },
  {
    name: "Organic",
    actions: [
      { prompt: "gentle breathing motion, subtle life", enabled: true },
      { prompt: "subtle sway, natural wind movement", enabled: true },
      { prompt: "floating drift, weightless motion", enabled: true },
      { prompt: "heartbeat pulse, rhythmic expansion", enabled: true },
    ],
  },
  {
    name: "Abstract",
    actions: [
      { prompt: "morph and flow, organic transformation", enabled: true },
      { prompt: "color shift, gradual hue rotation", enabled: true },
      { prompt: "kaleidoscope spin, symmetrical rotation", enabled: true },
      { prompt: "fractal zoom, infinite recursive detail", enabled: true },
    ],
  },
];

export const createActionsFromPreset = (preset: PresetPack): StudioAction[] =>
  preset.actions.map((a) => ({ ...a, id: uuidv4() }));
