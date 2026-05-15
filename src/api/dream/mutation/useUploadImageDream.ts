import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { DreamFileType, DreamMediaType } from "@/types/dream.types";
import type { CompletedPart } from "@/schemas/multipart-upload";
import { MY_DREAMS_QUERY_KEY } from "@/api/dream/query/useMyDreams";
import { DREAMS_QUERY_KEY } from "@/api/dream/query/useDreams";

export const UPLOAD_IMAGE_DREAM_MUTATION_KEY = "uploadImageDream";

const CHUNK_SIZE = 5 * 1024 * 1024;
const W_CREATE = 6;
const W_CHUNKS = 84;
const W_COMPLETE = 10;

export type UploadImageDreamVars = {
  file: File;
  onProgress?: (percent: number) => void;
};

export type UploadImageDreamResult = {
  dreamUuid: string;
  imageUrl: string;
  name: string;
};

const uploadImageDream = async ({
  file,
  onProgress,
}: UploadImageDreamVars): Promise<UploadImageDreamResult> => {
  const report = (n: number) => onProgress?.(Math.max(0, Math.min(100, n)));
  const headers = getRequestHeaders({ contentType: ContentType.json });
  const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const name = file.name.replace(/\.[^.]+$/, "");
  const partCount = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));

  report(1);

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

  const parts: CompletedPart[] = [];
  for (let i = 0; i < partCount; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const uploadRes = await fetch(urls[i], {
      method: "PUT",
      body: file.slice(start, end),
    });
    if (!uploadRes.ok) {
      throw new Error(`Chunk ${i + 1} upload failed: ${uploadRes.status}`);
    }
    parts.push({
      ETag: uploadRes.headers.get("ETag")?.replace(/^"|"$/g, "") ?? "",
      PartNumber: i + 1,
    });
    report(W_CREATE + ((i + 1) / partCount) * W_CHUNKS);
  }

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
