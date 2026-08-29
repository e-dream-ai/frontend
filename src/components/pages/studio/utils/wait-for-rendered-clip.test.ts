import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getDream: vi.fn() }));

vi.mock("../../../../api/dream/query/useDream", () => ({
  getDream: mocks.getDream,
}));

import { waitForRenderedClip } from "./wait-for-rendered-clip";

const options = { intervalMs: 0, delay: async () => {} };

describe("waitForRenderedClip", () => {
  beforeEach(() => vi.clearAllMocks());

  it("resolves true once the clip reaches processed", async () => {
    mocks.getDream
      .mockResolvedValueOnce({ status: "queue" })
      .mockResolvedValueOnce({ status: "processing" })
      .mockResolvedValueOnce({ status: "processed" });

    await expect(waitForRenderedClip("uuid", options)).resolves.toBe(true);
    expect(mocks.getDream).toHaveBeenCalledTimes(3);
  });

  it("does not settle on a media URL appearing before ingest finishes", async () => {
    // original_video is set before the normalised copy exists, and that copy is
    // the one the next clip has to open on.
    mocks.getDream
      .mockResolvedValueOnce({ status: "processing", original_video: "x.mp4" })
      .mockResolvedValueOnce({ status: "processed", video: "y.mp4" });

    await expect(waitForRenderedClip("uuid", options)).resolves.toBe(true);
    expect(mocks.getDream).toHaveBeenCalledTimes(2);
  });

  it("resolves false when the clip fails", async () => {
    mocks.getDream.mockResolvedValue({ status: "failed" });
    await expect(waitForRenderedClip("uuid", options)).resolves.toBe(false);
  });

  it("resolves false on timeout rather than hanging", async () => {
    mocks.getDream.mockResolvedValue({ status: "processing" });
    let clock = 0;
    await expect(
      waitForRenderedClip("uuid", {
        ...options,
        maxWaitMs: 10,
        now: () => (clock += 6),
      }),
    ).resolves.toBe(false);
  });

  it("resolves false when aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    mocks.getDream.mockResolvedValue({ status: "processed" });

    await expect(
      waitForRenderedClip("uuid", { ...options, signal: controller.signal }),
    ).resolves.toBe(false);
    expect(mocks.getDream).not.toHaveBeenCalled();
  });
});
