import type { Dream } from "@/types/dream.types";
import {
  imageOriginFromDreamPrompt,
  type GeneratedImageOrigin,
} from "./image-prompt";

export interface PromptHistoryEntry {
  uuid: string;
  name: string;
  thumbnail: string;
  width?: number;
  height?: number;
  createdAt: string;
  origin: GeneratedImageOrigin;
}

export const toPromptHistoryEntries = (
  dreams: readonly Dream[],
): PromptHistoryEntry[] =>
  dreams.flatMap((dream) => {
    const origin = imageOriginFromDreamPrompt(dream.prompt);
    if (origin.kind !== "generated") return [];
    return [
      {
        uuid: dream.uuid,
        name: dream.name,
        thumbnail: dream.thumbnail,
        width: dream.processedMediaWidth,
        height: dream.processedMediaHeight,
        createdAt: dream.created_at,
        origin,
      },
    ];
  });
