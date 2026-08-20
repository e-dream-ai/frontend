import type { StudioAction } from "@/types/studio.types";
import { v4 as uuidv4 } from "uuid";

export const PRESET_GROUPS = [
  { id: "transformations", label: "Transformations" },
  { id: "camera", label: "Camera" },
] as const;

export type PresetGroup = (typeof PRESET_GROUPS)[number]["id"];

export interface PresetPack {
  name: string;
  model: "wan-i2v" | "ltx-i2v" | "all";
  group: PresetGroup;
  actions: Omit<StudioAction, "id">[];
}

export const createActionsFromPreset = (preset: PresetPack): StudioAction[] =>
  preset.actions.map((a) => ({ ...a, id: uuidv4() }));
