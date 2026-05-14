import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";

export interface UploadResult {
  keyframeUuid: string;
  imageUrl: string;
  name: string;
}

export type UploadProgressFn = (percent: number) => void;

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

const W_CREATE = 4;
const W_INIT = 6;
const W_CHUNKS = 80;
const W_COMPLETE = 8;
const W_FINAL = 2;

export async function uploadKeyframeImage(
  file: File,
  onProgress?: UploadProgressFn,
): Promise<UploadResult> {
  const report = (n: number) => onProgress?.(Math.max(0, Math.min(100, n)));
  const headers = getRequestHeaders({ contentType: ContentType.json });
  const extension = file.name.split(".").pop() ?? "jpg";
  const name = file.name.replace(/\.[^.]+$/, "");

  report(1);

  // Step 1: Create keyframe
  const createRes = await axiosClient.post(
    "/v1/keyframe",
    { name },
    { headers },
  );
  const keyframeUuid = createRes.data.data.keyframe.uuid;
  report(W_CREATE);

  // Step 2: Init multipart upload
  const initRes = await axiosClient.post(
    `/v1/keyframe/${keyframeUuid}/image/init`,
    { extension },
    { headers },
  );
  const { uploadId, urls } = initRes.data.data;
  report(W_CREATE + W_INIT);

  // Step 3: Upload chunks to presigned URLs
  const parts: { ETag: string; PartNumber: number }[] = [];
  const chunkCount = urls.length;
  for (let i = 0; i < chunkCount; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);
    const uploadRes = await fetch(urls[i], {
      method: "PUT",
      body: chunk,
    });
    if (!uploadRes.ok) {
      throw new Error(`Chunk ${i + 1} upload failed: ${uploadRes.status}`);
    }
    parts.push({
      ETag: uploadRes.headers.get("ETag") ?? "",
      PartNumber: i + 1,
    });
    report(W_CREATE + W_INIT + ((i + 1) / chunkCount) * W_CHUNKS);
  }

  // Step 4: Complete multipart upload
  await axiosClient.post(
    `/v1/keyframe/${keyframeUuid}/image/complete`,
    { extension, parts, uploadId },
    { headers },
  );
  report(W_CREATE + W_INIT + W_CHUNKS + W_COMPLETE);

  // Step 5: Fetch finalized keyframe
  const kfRes = await axiosClient.get(`/v1/keyframe/${keyframeUuid}`, {
    headers,
  });
  const kfData = kfRes.data.data.keyframe;
  report(W_CREATE + W_INIT + W_CHUNKS + W_COMPLETE + W_FINAL); // 100

  return {
    keyframeUuid: kfData.uuid,
    imageUrl: kfData.image,
    name: kfData.name,
  };
}
