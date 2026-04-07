import type { StudioAction } from "@/types/studio.types";
import { v4 as uuidv4 } from "uuid";

export interface PresetPack {
  name: string;
  model: "wan-i2v" | "ltx-i2v" | "all";
  actions: Omit<StudioAction, "id">[];
}

const OSTRIS_BASE = "https://huggingface.co/ostris/wan22_i2v_14b";

const loraUrl = (repo: string, file: string) =>
  `${OSTRIS_BASE}_${repo}/resolve/main/${file}`;

export const ACTION_PRESETS: PresetPack[] = [
  {
    name: "Camera Basics",
    model: "wan-i2v",
    actions: [
      {
        prompt: "slow zoom in, camera gently pushing forward",
        enabled: false,
        highNoiseLoras: [
          {
            path: loraUrl("zoom_in_lora", "wan22_14b_i2v_zoom_in.safetensors"),
            scale: 1,
          },
        ],
      },
      {
        prompt: "slow zoom out, camera pulling back to reveal",
        enabled: false,
        highNoiseLoras: [
          {
            path: loraUrl(
              "zoom_out_lora",
              "wan22_14b_i2v_zoom_out.safetensors",
            ),
            scale: 1,
          },
        ],
      },
      {
        prompt: "pan left to right, smooth motion",
        enabled: false,
        highNoiseLoras: [
          {
            path: loraUrl(
              "pan_right_lora",
              "wan22_14b_i2v_pan_right.safetensors",
            ),
            scale: 1,
          },
        ],
      },
      {
        prompt: "pan right to left, smooth motion",
        enabled: false,
        highNoiseLoras: [
          {
            path: loraUrl(
              "pan_left_lora",
              "wan22_14b_i2v_pan_left.safetensors",
            ),
            scale: 1,
          },
        ],
      },
      {
        prompt: "pan upward, revealing sky",
        enabled: false,
        highNoiseLoras: [
          {
            path: loraUrl("tilt_up_lora", "wan22_14b_i2v_tilt_up.safetensors"),
            scale: 1,
          },
        ],
      },
      {
        prompt: "pan downward, descending",
        enabled: false,
        highNoiseLoras: [
          {
            path: loraUrl(
              "tilt_down_lora",
              "wan22_14b_i2v_tilt_down.safetensors",
            ),
            scale: 1,
          },
        ],
      },
      { prompt: "push in, dramatic approach", enabled: true },
      { prompt: "pull out, widening perspective", enabled: true },
    ],
  },
  {
    name: "Cinematic",
    model: "wan-i2v",
    actions: [
      { prompt: "dolly forward, smooth cinematic approach", enabled: true },
      {
        prompt: "orbit around subject, 180 degrees, smooth motion",
        enabled: false,
        highNoiseLoras: [
          {
            path: loraUrl(
              "orbit_shot_lora",
              "wan22_14b_i2v_orbit_high_noise.safetensors",
            ),
            scale: 1,
          },
        ],
        lowNoiseLoras: [
          {
            path: loraUrl(
              "orbit_shot_lora",
              "wan22_14b_i2v_orbit_low_noise.safetensors",
            ),
            scale: 1,
          },
        ],
      },
      { prompt: "crane up, rising above the scene", enabled: true },
      {
        prompt: "tracking shot, following motion left to right",
        enabled: false,
      },
      { prompt: "rack focus, shifting depth of field", enabled: true },
    ],
  },
  {
    name: "LTX Camera",
    model: "ltx-i2v",
    actions: [
      {
        prompt: "static camera, subtle ambient movement",
        enabled: true,
        highNoiseLoras: [
          {
            path: "ltx-2-19b-lora-camera-control-static.safetensors",
            scale: 0.4,
          },
        ],
      },
      {
        prompt: "slow dolly in, camera pushing forward into the scene",
        enabled: false,
        highNoiseLoras: [
          {
            path: "ltx-2-19b-lora-camera-control-dolly-in.safetensors",
            scale: 0.4,
          },
        ],
      },
      {
        prompt: "slow dolly out, camera pulling back to reveal",
        enabled: false,
        highNoiseLoras: [
          {
            path: "ltx-2-19b-lora-camera-control-dolly-out.safetensors",
            scale: 0.4,
          },
        ],
      },
      {
        prompt: "jib up, camera rising above the scene",
        enabled: false,
        highNoiseLoras: [
          {
            path: "ltx-2-19b-lora-camera-control-jib-up.safetensors",
            scale: 0.4,
          },
        ],
      },
      {
        prompt: "jib down, camera descending into the scene",
        enabled: false,
        highNoiseLoras: [
          {
            path: "ltx-2-19b-lora-camera-control-jib-down.safetensors",
            scale: 0.4,
          },
        ],
      },
    ],
  },
  {
    name: "Organic",
    model: "all",
    actions: [
      { prompt: "gentle breathing motion, subtle life", enabled: true },
      { prompt: "subtle sway, natural wind movement", enabled: true },
      { prompt: "floating drift, weightless motion", enabled: true },
      { prompt: "heartbeat pulse, rhythmic expansion", enabled: true },
    ],
  },
  {
    name: "Abstract",
    model: "all",
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
