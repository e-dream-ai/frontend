import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";

export interface UploadResult {
  keyframeUuid: string;
  imageUrl: string;
  name: string;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadKeyframeImage(file: File): Promise<UploadResult> {
  const headers = getRequestHeaders({ contentType: ContentType.json });
  const extension = file.name.split(".").pop() ?? "jpg";
  const name = file.name.replace(/\.[^.]+$/, "");

  // Step 1: Create keyframe
  const createRes = await axiosClient.post(
    "/v1/keyframe",
    { name },
    { headers },
  );
  const keyframeUuid = createRes.data.data.keyframe.uuid;

  // Step 2: Init multipart upload
  const initRes = await axiosClient.post(
    `/v1/keyframe/${keyframeUuid}/image/init`,
    { extension },
    { headers },
  );
  const { uploadId, urls } = initRes.data.data;

  // Step 3: Upload chunks to presigned URLs
  const parts: { ETag: string; PartNumber: number }[] = [];
  for (let i = 0; i < urls.length; i++) {
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
  }

  // Step 4: Complete multipart upload
  await axiosClient.post(
    `/v1/keyframe/${keyframeUuid}/image/complete`,
    { extension, parts, uploadId },
    { headers },
  );

  // Step 5: Fetch finalized keyframe
  const kfRes = await axiosClient.get(`/v1/keyframe/${keyframeUuid}`, {
    headers,
  });
  const kfData = kfRes.data.data.keyframe;

  return {
    keyframeUuid: kfData.uuid,
    imageUrl: kfData.image,
    name: kfData.name,
  };
}
