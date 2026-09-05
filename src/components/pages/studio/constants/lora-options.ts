import type { LoRAConfig, VideoModel } from "@/types/studio.types";
import { ACTION_PRESETS } from "./action-presets";

export interface LoraOption {
  /** LoRA path, used as the select value. Empty string means "no LoRA". */
  key: string;
  label: string;
  highNoiseLoras: LoRAConfig[];
  lowNoiseLoras: LoRAConfig[];
}

export const NO_LORA_OPTION: LoraOption = {
  key: "",
  label: "No LoRA",
  highNoiseLoras: [],
  lowNoiseLoras: [],
};

/**
 * Camera-control LoRAs baked into gpu-container-ltx at /comfyui/models/loras/.
 * `path` is a bare filename, not a URL — ComfyUI resolves it against that
 * directory, so these must match the Dockerfile wgets byte-for-byte. A name
 * that isn't present fails silently: ComfyUI logs `lora key not loaded` and
 * returns base-model output while the job still reports success.
 *
 * Source of truth: gpu-container-ltx/Dockerfile, "Camera LoRAs" block.
 * Deliberately excludes ltx-2-19b-distilled-lora-384.safetensors, which lives
 * in the same directory but is applied unconditionally by the worker (node 7)
 * to keep few-step LCM sampling on the dev transformer — offering it here
 * would double-apply it.
 */
const LTX_LORA_SCALE = 0.4;

const ltxLora = (label: string, file: string): LoraOption => ({
  key: `ltx-2-19b-lora-camera-control-${file}.safetensors`,
  label,
  highNoiseLoras: [
    {
      path: `ltx-2-19b-lora-camera-control-${file}.safetensors`,
      scale: LTX_LORA_SCALE,
    },
  ],
  lowNoiseLoras: [],
});

export const LTX_LORA_OPTIONS: LoraOption[] = [
  ltxLora("Static", "static"),
  ltxLora("Dolly In", "dolly-in"),
  ltxLora("Dolly Out", "dolly-out"),
  ltxLora("Dolly Left", "dolly-left"),
  ltxLora("Dolly Right", "dolly-right"),
  ltxLora("Jib Up", "jib-up"),
  ltxLora("Jib Down", "jib-down"),
];

/**
 * LoRAs reachable for a model. LTX draws on the fixed set baked into our
 * container; other models keep deriving theirs from the preset packs, where
 * the path is a HuggingFace URL the provider fetches at run time.
 */
export const getLoraOptionsForModel = (model: VideoModel): LoraOption[] => {
  if (model === "ltx-i2v") {
    return LTX_LORA_OPTIONS;
  }

  const options: LoraOption[] = [];
  const seen = new Set<string>();

  for (const pack of ACTION_PRESETS) {
    if (pack.model !== model && pack.model !== "all") continue;
    for (const action of pack.actions) {
      if (!action.highNoiseLoras?.length) continue;
      const path = action.highNoiseLoras[0].path;
      if (seen.has(path)) continue;
      seen.add(path);
      options.push({
        key: path,
        // Derive a short label from the action's prompt (first clause).
        label: action.prompt.split(",")[0].trim(),
        highNoiseLoras: action.highNoiseLoras,
        lowNoiseLoras: action.lowNoiseLoras ?? [],
      });
    }
  }
  return options;
};
