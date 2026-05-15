import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock axios module - this creates a mock axios.create() that returns our mock instance
const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock("axios", () => {
  return {
    default: {
      create: () => ({
        post: mockPost,
        get: mockGet,
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }),
    },
  };
});

vi.mock("@/constants/auth.constants", () => ({
  getRequestHeaders: vi.fn(() => ({ Authorization: "Bearer test" })),
  ContentType: { json: "application/json" },
}));

vi.mock("@/constants/api.constants", () => ({
  URL: "http://test-api",
}));

const { uploadKeyframeImage } = await import("../upload-keyframe-image");

describe("uploadKeyframeImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  it("returns keyframeUuid, imageUrl, and name on success", async () => {
    // Step 1: POST /v1/keyframe
    mockPost.mockResolvedValueOnce({
      data: { data: { keyframe: { uuid: "kf-123" } } },
    });
    // Step 2: POST /v1/keyframe/kf-123/image/init
    mockPost.mockResolvedValueOnce({
      data: {
        data: { uploadId: "up-1", urls: ["https://s3.example.com/part1"] },
      },
    });
    // Step 4: POST /v1/keyframe/kf-123/image/complete
    mockPost.mockResolvedValueOnce({ data: {} });
    // Step 5: GET /v1/keyframe/kf-123
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          keyframe: {
            uuid: "kf-123",
            image: "https://cdn.example.com/kf-123.jpg",
            name: "photo",
          },
        },
      },
    });

    // Step 3: PUT chunk to presigned URL
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(null, {
        status: 200,
        headers: { ETag: '"abc123"' },
      }),
    );

    const file = new File(["pixels"], "photo.jpg", { type: "image/jpeg" });
    const result = await uploadKeyframeImage(file);

    expect(result).toEqual({
      keyframeUuid: "kf-123",
      imageUrl: "https://cdn.example.com/kf-123.jpg",
      name: "photo",
    });

    // Verify API calls
    expect(mockPost).toHaveBeenCalledTimes(3);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockPost.mock.calls[0][0]).toBe("/v1/keyframe");
    expect(mockPost.mock.calls[1][0]).toBe("/v1/keyframe/kf-123/image/init");
    expect(mockPost.mock.calls[2][0]).toBe(
      "/v1/keyframe/kf-123/image/complete",
    );
    expect(mockGet.mock.calls[0][0]).toBe("/v1/keyframe/kf-123");
  });

  it("throws on API failure", async () => {
    mockPost.mockRejectedValueOnce(new Error("Network error"));

    const file = new File(["pixels"], "photo.jpg", { type: "image/jpeg" });
    await expect(uploadKeyframeImage(file)).rejects.toThrow("Network error");
  });
});
