import { describe, expect, it } from "vitest";
import { estimateUnitCostUsd } from "../model-cost.util";
import type { ModelCatalogEntry } from "@/types/model.types";

const perImageModel: ModelCatalogEntry = {
  id: "flux-kontext-i2i",
  label: "FLUX.1 Kontext",
  provider: "fal",
  mediaType: "image",
  constraints: {},
  pricing: { kind: "perImage", usdPerImage: 0.04 },
};

describe("estimateUnitCostUsd — perImage", () => {
  it("is a flat per-image cost, independent of size", () => {
    expect(estimateUnitCostUsd(perImageModel, {})).toBeCloseTo(0.04);
    expect(
      estimateUnitCostUsd(perImageModel, { imageSize: "1024*1024" }),
    ).toBeCloseTo(0.04);
  });
});
