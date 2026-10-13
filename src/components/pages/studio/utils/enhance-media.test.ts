import { describe, it, expect } from "vitest";
import {
  defaultUpscaleFactor,
  describePlaylistFps,
  describePlaylistResolution,
  describeEnhanceResult,
} from "./enhance-media";
import type { PlaylistMediaSummary } from "../../../../types/playlist.types";

const media = (
  overrides: Partial<PlaylistMediaSummary> = {},
): PlaylistMediaSummary => ({
  width: 1280,
  height: 720,
  minShortSide: 720,
  fps: 24,
  mixedResolution: false,
  mixedFps: false,
  ...overrides,
});

describe("describePlaylistResolution", () => {
  it("shows a uniform resolution as is", () => {
    expect(describePlaylistResolution(media())).toBe("1280×720");
  });

  it("shows the highest resolution and flags a mixed playlist", () => {
    expect(
      describePlaylistResolution(
        media({ width: 1920, height: 1080, mixedResolution: true }),
      ),
    ).toBe("up to 1920×1080 (mixed)");
  });
});

describe("describePlaylistFps", () => {
  it("shows a uniform fps as is", () => {
    expect(describePlaylistFps(media({ fps: 29.97 }))).toBe("29.97 fps");
  });

  it("shows the highest fps and flags a mixed playlist", () => {
    expect(describePlaylistFps(media({ fps: 30, mixedFps: true }))).toBe(
      "up to 30 fps (mixed)",
    );
  });

  it("is null when unknown", () => {
    expect(describePlaylistFps(media({ fps: null }))).toBeNull();
  });
});

describe("defaultUpscaleFactor", () => {
  it("upscales below 1080p", () => {
    expect(defaultUpscaleFactor(media())).toBe(2);
  });

  it("skips upscaling when every dream is 1080p or above", () => {
    expect(defaultUpscaleFactor(media({ minShortSide: 1080 }))).toBe(1);
    expect(defaultUpscaleFactor(media({ minShortSide: 2160 }))).toBe(1);
  });

  it("upscales a mixed playlist when any dream is below 1080p", () => {
    expect(
      defaultUpscaleFactor(
        media({ width: 1920, height: 1080, mixedResolution: true }),
      ),
    ).toBe(2);
  });

  it("upscales when the resolution is unknown", () => {
    expect(defaultUpscaleFactor(null)).toBe(2);
  });
});

describe("describeEnhanceResult", () => {
  it("shows the resolution and fps change", () => {
    expect(describeEnhanceResult(media(), 2, 2)).toBe(
      "1280×720 → 2560×1440 • 24 fps → 48 fps",
    );
  });

  it("does not show a change for a 1× factor", () => {
    expect(
      describeEnhanceResult(media({ width: 1920, height: 1080 }), 1, 4),
    ).toBe("1920×1080 • 24 fps → 96 fps");
    expect(describeEnhanceResult(media(), 4, 1)).toBe(
      "1280×720 → 5120×2880 • 24 fps",
    );
  });

  it("leaves out fps when unknown, and rounds the source fps like the worker", () => {
    expect(describeEnhanceResult(media({ fps: null }), 2, 2)).toBe(
      "1280×720 → 2560×1440",
    );
    expect(describeEnhanceResult(media({ fps: 29.97 }), 2, 2)).toBe(
      "1280×720 → 2560×1440 • 29.97 fps → 60 fps",
    );
  });

  it("shows the highest values as up to for a mixed playlist", () => {
    expect(
      describeEnhanceResult(
        media({
          width: 1920,
          height: 1080,
          fps: 30,
          mixedResolution: true,
          mixedFps: true,
        }),
        2,
        2,
      ),
    ).toBe("up to 1920×1080 → 3840×2160 • up to 30 fps → 60 fps");
  });
});
