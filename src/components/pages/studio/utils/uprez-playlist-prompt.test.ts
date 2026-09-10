import { describe, it, expect } from "vitest";
import { buildUprezPlaylistPrompt } from "./uprez-playlist-prompt";
import { parseUprezPlaylistPrompt } from "../../../../types/playlist.types";

describe("buildUprezPlaylistPrompt", () => {
  const prompt = buildUprezPlaylistPrompt({
    sourcePlaylistUuid: "0d1b1e5e-1111-4222-8333-444455556666",
    upscaleFactor: 2,
    interpolationFactor: 4,
  });

  it("emits the exact fields the backend's isUprezPlaylistPrompt checks", () => {
    expect(prompt.infinidream_algorithm).toBe("uprez_playlist");
    expect(prompt.source_playlist_uuid).toBe(
      "0d1b1e5e-1111-4222-8333-444455556666",
    );
  });

  it("names the per-dream algorithm the run endpoint enqueues", () => {
    expect(prompt.dream_algorithm).toBe("uprez");
  });

  it("passes the factors through as snake_case params", () => {
    expect(prompt.params).toEqual({
      upscale_factor: 2,
      interpolation_factor: 4,
    });
  });

  it("round-trips through the parser used to detect uprez playlists", () => {
    expect(parseUprezPlaylistPrompt(JSON.stringify(prompt))).toEqual(prompt);
  });
});
