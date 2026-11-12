import { describe, expect, it } from "vitest";
import type { ModelCatalogEntry } from "@/types/model.types";
import { estimateUnitCostUsd } from "./model-cost.util";

const model = (pricing: ModelCatalogEntry["pricing"]): ModelCatalogEntry => ({
  id: "test-model",
  label: "Test",
  provider: "fal",
  mediaType: "image",
  constraints: {},
  pricing,
});

describe("estimateUnitCostUsd", () => {
  it("prices a per-image model the same at any size", () => {
    const krea = model({ kind: "perImage", usdPerImage: 0.06 });
    expect(estimateUnitCostUsd(krea, { imageSize: "1280*720" })).toBe(0.06);
    expect(estimateUnitCostUsd(krea, {})).toBe(0.06);
  });

  it("prices a per-megapixel model by its output area", () => {
    const turbo = model({ kind: "perMegapixel", usdPerMegapixel: 0.008 });
    expect(estimateUnitCostUsd(turbo, { imageSize: "1280*720" })).toBeCloseTo(
      0.0073728,
      8,
    );
    expect(estimateUnitCostUsd(turbo, {})).toBeNull();
  });
});
