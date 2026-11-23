import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveDreamMedia } from "./resolve-dream-media";

const mocks = vi.hoisted(() => ({
  getDreamResponse: vi.fn(),
  setQueryData: vi.fn(),
}));

vi.mock("../../../../api/dream/query/useDream", () => ({
  DREAM_QUERY_KEY: "getDream",
  getDreamResponse: mocks.getDreamResponse,
}));

vi.mock("../../../../api/query-client", () => ({
  default: { setQueryData: mocks.setQueryData },
}));

const response = (dream: object) => ({ success: true, data: { dream } });

describe("resolveDreamMedia", () => {
  beforeEach(() => {
    mocks.getDreamResponse.mockReset();
    mocks.setQueryData.mockReset();
  });

  it("refreshes the cached dream when the media is ready", async () => {
    const processing = response({ uuid: "d1", status: "processing" });
    const done = response({
      uuid: "d1",
      status: "processed",
      original_video: "https://media/d1.webp",
      prompt: '{"prompt":"a cat","actual_prompt":"a sleek tabby cat"}',
    });
    mocks.getDreamResponse
      .mockResolvedValueOnce(processing)
      .mockResolvedValueOnce(done);

    const dream = await resolveDreamMedia("d1", { intervalMs: 0 });

    expect(dream?.original_video).toBe("https://media/d1.webp");
    expect(mocks.setQueryData).toHaveBeenCalledTimes(1);
    expect(mocks.setQueryData).toHaveBeenCalledWith(["getDream", "d1"], done);
  });

  it("leaves the cache alone when the dream fails", async () => {
    mocks.getDreamResponse.mockResolvedValue(
      response({ uuid: "d1", status: "failed" }),
    );

    await expect(
      resolveDreamMedia("d1", { intervalMs: 0 }),
    ).resolves.toBeUndefined();
    expect(mocks.setQueryData).not.toHaveBeenCalled();
  });
});
