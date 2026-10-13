import { describe, it, expect } from "vitest";
import { buildEnhancePlaylistPrompt } from "./enhance-playlist-prompt";
import { parseEnhancePlaylistPrompt } from "../../../../types/playlist.types";

describe("buildEnhancePlaylistPrompt", () => {
  const prompt = buildEnhancePlaylistPrompt({
    sourcePlaylistUuid: "0d1b1e5e-1111-4222-8333-444455556666",
    upscaleFactor: 2,
    interpolationFactor: 4,
  });

  it("emits the exact fields the backend's isEnhancePlaylistPrompt checks", () => {
    expect(prompt.infinidream_algorithm).toBe("enhance_playlist");
    expect(prompt.source_playlist_uuid).toBe(
      "0d1b1e5e-1111-4222-8333-444455556666",
    );
  });

  it("names the per-dream algorithm the run endpoint enqueues", () => {
    expect(prompt.dream_algorithm).toBe("enhance");
  });

  it("passes the factors through as snake_case params", () => {
    expect(prompt.params).toEqual({
      upscale_factor: 2,
      interpolation_factor: 4,
    });
  });

  it("round-trips through the parser used to detect enhance playlists", () => {
    expect(parseEnhancePlaylistPrompt(JSON.stringify(prompt))).toEqual(prompt);
  });
});
