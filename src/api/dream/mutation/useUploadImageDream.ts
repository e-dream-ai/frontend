import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { DreamFileType, DreamMediaType } from "@/types/dream.types";
import type { CompletedPart } from "@/schemas/multipart-upload";
import { MY_DREAMS_QUERY_KEY } from "@/api/dream/query/useMyDreams";
import { DREAMS_QUERY_KEY } from "@/api/dream/query/useDreams";
import { encodeImageForUpload } from "@/utils/image-encode/image-encode";

export const UPLOAD_IMAGE_DREAM_MUTATION_KEY = "uploadImageDream";

const CHUNK_SIZE = 5 * 1024 * 1024;
const W_CREATE = 6;
const W_CHUNKS = 84;
const W_COMPLETE = 10;

export type UploadImageDreamVars = {
  file: File;
  onProgress?: (percent: number) => void;
  onUploadComplete?: (dreamUuid: string) => void;
};

export type UploadImageDreamResult = {
  dreamUuid: string;
  imageUrl: string;
  name: string;
};

const uploadPart = async (url: string, body: Blob, partNumber: number) => {
  const response = await fetch(url, { method: "PUT", body });
  if (!response.ok) {
    throw new Error(`Chunk ${partNumber} upload failed: ${response.status}`);
  }
  return {
    ETag: response.headers.get("ETag")?.replace(/^"|"$/g, "") ?? "",
    PartNumber: partNumber,
  };
};

const uploadImageDream = async ({
  file: image,
  onProgress,
  onUploadComplete,
}: UploadImageDreamVars): Promise<UploadImageDreamResult> => {
  const report = (n: number) => onProgress?.(Math.max(0, Math.min(100, n)));
  const headers = getRequestHeaders({ contentType: ContentType.json });
  const name = image.name.replace(/\.[^.]+$/, "");

  report(1);

  const file = await encodeImageForUpload(image, "dream");
  const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const partCount = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));

  const createRes = await axiosClient.post(
    "/v1/dream/create-multipart-upload",
    {
      name,
      extension,
      parts: partCount,
      mediaType: DreamMediaType.IMAGE,
    },
    { headers },
  );
  const { dream, urls, uploadId } = createRes.data.data;
  const dreamUuid: string = dream.uuid;
  report(W_CREATE);

  let uploadedBytes = 0;
  const parts: CompletedPart[] = await Promise.all(
    Array.from({ length: partCount }, async (_, index) => {
      const chunk = file.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE);
      const part = await uploadPart(urls[index], chunk, index + 1);
      uploadedBytes += chunk.size;
      report(W_CREATE + (uploadedBytes / file.size) * W_CHUNKS);
      return part;
    }),
  );

  await axiosClient.post(
    `/v1/dream/${dreamUuid}/complete-multipart-upload`,
    {
      type: DreamFileType.DREAM,
      extension,
      uploadId,
      parts,
      processed: false,
    },
    { headers },
  );
  report(W_CREATE + W_CHUNKS + W_COMPLETE);
  onUploadComplete?.(dreamUuid);

  const dreamRes = await axiosClient.get(`/v1/dream/${dreamUuid}`, { headers });
  const finalDream = dreamRes.data.data.dream;
  const imageUrl: string =
    finalDream.video || finalDream.original_video || finalDream.thumbnail || "";
  report(100);

  return { dreamUuid, imageUrl, name: finalDream.name ?? name };
};

export const useUploadImageDream = () => {
  const queryClient = useQueryClient();
  return useMutation<UploadImageDreamResult, Error, UploadImageDreamVars>(
    uploadImageDream,
    {
      mutationKey: [UPLOAD_IMAGE_DREAM_MUTATION_KEY],
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [MY_DREAMS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [DREAMS_QUERY_KEY] });
      },
    },
  );
};
