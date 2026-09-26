import { describe, expect, it } from "vitest";
import type { StudioAction, VideoModel } from "../../../../types/studio.types";
import {
  actionLorasFitModel,
  getLoraOptionsForModel,
  retargetActionLoras,
} from "./lora-options";

const pick = (model: VideoModel, label: string): StudioAction => {
  const option = getLoraOptionsForModel(model).find((o) => o.label === label);
  if (!option) throw new Error(`no ${label} LoRA for ${model}`);
  return {
    id: "a",
    prompt: "p",
    highNoiseLoras: [...option.highNoiseLoras],
    lowNoiseLoras: [...option.lowNoiseLoras],
  };
};

const labelOf = (action: StudioAction, model: VideoModel) =>
  getLoraOptionsForModel(model).find(
    (o) => o.key === action.highNoiseLoras?.[0]?.path,
  )?.label ?? "none";

describe("retargetActionLoras", () => {
  it("maps a camera move to the same move on the other model", () => {
    const wan = retargetActionLoras(pick("ltx-i2v", "Dolly In"), "wan-i2v");
    expect(labelOf(wan, "wan-i2v")).toBe("Zoom In");
    const back = retargetActionLoras(wan, "ltx-i2v");
    expect(labelOf(back, "ltx-i2v")).toBe("Dolly In");
  });

  it("goes to none without a match, and restores it on the way back", () => {
    const wan = retargetActionLoras(pick("ltx-i2v", "Static"), "wan-i2v");
    expect(wan.highNoiseLoras).toEqual([]);
    const back = retargetActionLoras(wan, "ltx-i2v");
    expect(labelOf(back, "ltx-i2v")).toBe("Static");
    expect(back.loraMemory).toBeUndefined();
  });

  it("brings back a Wan-only pick after a detour through LTX", () => {
    const ltx = retargetActionLoras(pick("wan-i2v", "Orbit"), "ltx-i2v");
    expect(ltx.highNoiseLoras).toEqual([]);
    const wan = retargetActionLoras(ltx, "wan-i2v");
    expect(labelOf(wan, "wan-i2v")).toBe("Orbit");
    expect(wan.lowNoiseLoras?.length).toBeGreaterThan(0);
  });

  it("prefers a pick made since the switch over the remembered one", () => {
    const wan = retargetActionLoras(pick("ltx-i2v", "Static"), "wan-i2v");
    const chosen = { ...wan, ...pick("wan-i2v", "Pan Left"), id: wan.id };
    const back = retargetActionLoras(chosen, "ltx-i2v");
    expect(labelOf(back, "ltx-i2v")).toBe("Dolly Left");
  });

  it("leaves the LoRA alone on a model without LoRAs", () => {
    const action = pick("ltx-i2v", "Jib Up");
    expect(retargetActionLoras(action, "kling-i2v")).toBe(action);
    expect(actionLorasFitModel(action, "kling-i2v")).toBe(false);
    const wan = retargetActionLoras(action, "wan-i2v");
    expect(labelOf(wan, "wan-i2v")).toBe("Tilt Up");
  });
});
