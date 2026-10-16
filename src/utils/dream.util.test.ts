import { describe, it, expect } from "vitest";
import { isDreamPlayable } from "./dream.util";
import { Dream, DreamMediaType, DreamStatusType } from "../types/dream.types";

const dream = (overrides: Partial<Dream>): Dream =>
  ({
    uuid: "d",
    status: DreamStatusType.PROCESSED,
    mediaType: DreamMediaType.VIDEO,
    ...overrides,
  }) as Dream;

describe("isDreamPlayable", () => {
  it("plays a processed video", () => {
    expect(isDreamPlayable(dream({}))).toBe(true);
  });

  it("does not play a still image", () => {
    expect(isDreamPlayable(dream({ mediaType: DreamMediaType.IMAGE }))).toBe(
      false,
    );
  });

  it("does not play a dream that is still rendering", () => {
    expect(isDreamPlayable(dream({ status: DreamStatusType.QUEUE }))).toBe(
      false,
    );
    expect(isDreamPlayable(dream({ status: DreamStatusType.PROCESSING }))).toBe(
      false,
    );
  });

  it("treats a dream with no media type as a video", () => {
    expect(isDreamPlayable(dream({ mediaType: undefined }))).toBe(true);
  });

  it("does not play a missing dream", () => {
    expect(isDreamPlayable(undefined)).toBe(false);
  });
});
