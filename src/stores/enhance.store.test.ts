import { beforeEach, describe, expect, it } from "vitest";
import { selectEnhanceProject, useEnhanceStore } from "./enhance.store";

const store = () => useEnhanceStore.getState();

beforeEach(() => store().resetEnhance());

describe("enhance store", () => {
  it("restores the saved interpolation factor when a project is reopened", () => {
    store().setInterpolationFactor(4);
    const saved = selectEnhanceProject(store());

    store().resetEnhance();
    store().restoreEnhance(saved);

    expect(store().interpolationFactor).toBe(4);
  });

  it("falls back to the default factors when the snapshot has none", () => {
    store().setInterpolationFactor(4);
    store().restoreEnhance({});

    expect(store().interpolationFactor).toBe(2);
    expect(store().upscaleFactor).toBe(2);
  });

  it("starts a new project at the default interpolation factor", () => {
    store().setInterpolationFactor(4);
    store().resetEnhance();

    expect(store().interpolationFactor).toBe(2);
  });
});
