import type { PresetAction, PresetPack } from "./preset-packs";

const OSTRIS_BASE = "https://huggingface.co/ostris/wan22_i2v_14b";

const loraUrl = (repo: string, file: string) =>
  `${OSTRIS_BASE}_${repo}/resolve/main/${file}`;

export type LtxCameraDirection =
  | "static"
  | "dolly-in"
  | "dolly-out"
  | "dolly-left"
  | "dolly-right"
  | "jib-up"
  | "jib-down";

export type LtxCameraLoraFile =
  `ltx-2-19b-lora-camera-control-${LtxCameraDirection}.safetensors`;

export const ltxCameraLoraFile = (
  direction: LtxCameraDirection,
): LtxCameraLoraFile =>
  `ltx-2-19b-lora-camera-control-${direction}.safetensors`;

export const LTX_CAMERA_LORA_SCALE = 0.4;

const ltxCameraAction = (
  direction: LtxCameraDirection,
  loraLabel: string,
  prompt: string,
): PresetAction => ({
  prompt,
  loraLabel,
  highNoiseLoras: [
    { path: ltxCameraLoraFile(direction), scale: LTX_CAMERA_LORA_SCALE },
  ],
});

export const ACTION_PRESETS: PresetPack[] = [
  {
    name: "Camera Basics",
    model: "wan-i2v",
    group: "camera",
    actions: [
      {
        prompt: "slow zoom in, camera gently pushing forward",
        loraLabel: "Zoom In",
        highNoiseLoras: [
          {
            path: loraUrl("zoom_in_lora", "wan22_14b_i2v_zoom_in.safetensors"),
            scale: 1,
          },
        ],
      },
      {
        prompt: "slow zoom out, camera pulling back to reveal",
        loraLabel: "Zoom Out",
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
        loraLabel: "Pan Right",
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
        loraLabel: "Pan Left",
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
        loraLabel: "Tilt Up",
        highNoiseLoras: [
          {
            path: loraUrl("tilt_up_lora", "wan22_14b_i2v_tilt_up.safetensors"),
            scale: 1,
          },
        ],
      },
      {
        prompt: "pan downward, descending",
        loraLabel: "Tilt Down",
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
      { prompt: "push in, dramatic approach" },
      { prompt: "pull out, widening perspective" },
    ],
  },
  {
    name: "Cinematic",
    model: "wan-i2v",
    group: "camera",
    actions: [
      { prompt: "dolly forward, smooth cinematic approach" },
      {
        prompt: "orbit around subject, 180 degrees, smooth motion",
        loraLabel: "Orbit",
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
      { prompt: "crane up, rising above the scene" },
      {
        prompt: "tracking shot, following motion left to right",
      },
      { prompt: "rack focus, shifting depth of field" },
    ],
  },
  {
    name: "LTX Camera",
    model: "ltx-i2v",
    group: "camera",
    actions: [
      ltxCameraAction(
        "static",
        "Static",
        "static camera, subtle ambient movement",
      ),
      ltxCameraAction(
        "dolly-in",
        "Dolly In",
        "slow dolly in, camera pushing forward into the scene",
      ),
      ltxCameraAction(
        "dolly-out",
        "Dolly Out",
        "slow dolly out, camera pulling back to reveal",
      ),
      ltxCameraAction(
        "dolly-left",
        "Dolly Left",
        "dolly left, camera sliding to the left",
      ),
      ltxCameraAction(
        "dolly-right",
        "Dolly Right",
        "dolly right, camera sliding to the right",
      ),
      ltxCameraAction(
        "jib-up",
        "Jib Up",
        "jib up, camera rising above the scene",
      ),
      ltxCameraAction(
        "jib-down",
        "Jib Down",
        "jib down, camera descending into the scene",
      ),
    ],
  },
  {
    name: "Organic",
    model: "all",
    group: "transformations",
    actions: [
      { prompt: "gentle breathing motion, subtle life" },
      { prompt: "subtle sway, natural wind movement" },
      { prompt: "floating drift, weightless motion" },
      { prompt: "heartbeat pulse, rhythmic expansion" },
    ],
  },
  {
    name: "Abstract",
    model: "all",
    group: "transformations",
    actions: [
      {
        prompt:
          "The scene transitions through a continuous, viscous metamorphosis, forms dissolving and rebuilding from within as though the material itself is alive. Shape bleeds into shape with cellular fluidity - no cut, no dissolve, no opacity ramp - only the slow-pressure pull of one state becoming another. Camera holds locked and still throughout. The transformation drives forward with organic inevitability, each intermediate state a coherent world briefly passing through.",
      },
      { prompt: "color shift, gradual hue rotation" },
      { prompt: "kaleidoscope spin, symmetrical rotation" },
      { prompt: "fractal zoom, infinite recursive detail" },
    ],
  },
];
