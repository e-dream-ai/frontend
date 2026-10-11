import { describe, it, expect } from "vitest";
import {
  defaultUpscaleFactor,
  describePlaylistFps,
  describePlaylistResolution,
  describeUprezResult,
} from "./uprez-media";
import type { PlaylistMediaSummary } from "../../../../types/playlist.types";

const media = (
  overrides: Partial<PlaylistMediaSummary> = {},
): PlaylistMediaSummary => ({
  width: 1280,
  height: 720,
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

  it("skips upscaling at 1080p and above", () => {
    expect(defaultUpscaleFactor(media({ width: 1920, height: 1080 }))).toBe(1);
    expect(defaultUpscaleFactor(media({ width: 3840, height: 2160 }))).toBe(1);
  });

  it("uses the short side, so portrait 1080p counts", () => {
    expect(defaultUpscaleFactor(media({ width: 1080, height: 1920 }))).toBe(1);
    expect(defaultUpscaleFactor(media({ width: 720, height: 1920 }))).toBe(2);
  });

  it("upscales when the resolution is unknown", () => {
    expect(defaultUpscaleFactor(null)).toBe(2);
  });
});

describe("describeUprezResult", () => {
  it("shows the resolution and fps change", () => {
    expect(describeUprezResult(media(), 2, 2)).toBe(
      "1280×720 → 2560×1440 · 24 → 48 fps",
    );
  });

  it("does not show a change for a 1× factor", () => {
    expect(
      describeUprezResult(media({ width: 1920, height: 1080 }), 1, 4),
    ).toBe("1920×1080 · 24 → 96 fps");
    expect(describeUprezResult(media(), 4, 1)).toBe(
      "1280×720 → 5120×2880 · 24 fps",
    );
  });

  it("leaves out fps when unknown, and rounds fractional rates", () => {
    expect(describeUprezResult(media({ fps: null }), 2, 2)).toBe(
      "1280×720 → 2560×1440",
    );
    expect(describeUprezResult(media({ fps: 29.97 }), 2, 2)).toBe(
      "1280×720 → 2560×1440 · 29.97 → 59.94 fps",
    );
  });
});
