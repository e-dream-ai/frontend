import { useCallback, useState } from "react";
import type { FlowReferenceFrame } from "@/types/flow.types";
import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";
import { useFlowStore } from "@/stores/flow.store";

export function useReferenceFrameImage(frame: FlowReferenceFrame | undefined) {
  const updateReferenceFrame = useFlowStore((s) => s.updateReferenceFrame);
  const [override, setOverride] = useState<{
    replaces: string;
    url: string;
  } | null>(null);

  const { id, imageUrl, dreamUuid, isLoopFrame } = frame ?? {};
  const src =
    override !== null && override.replaces === imageUrl
      ? override.url
      : imageUrl;

  const refresh = useCallback(async () => {
    if (!dreamUuid || id === undefined || imageUrl === undefined) return;
    try {
      const headers = getRequestHeaders({ contentType: ContentType.json });
      const { data } = await axiosClient.get(`/v1/dream/${dreamUuid}`, {
        headers,
      });
      const dream = data?.data?.dream;
      const freshUrl: string =
        dream?.video || dream?.original_video || dream?.thumbnail || "";
      if (!freshUrl) return;
      setOverride({ replaces: imageUrl, url: freshUrl });
      // The loop frame mirrors frame 0 and isn't a real store entry.
      if (!isLoopFrame) updateReferenceFrame(id, { imageUrl: freshUrl });
    } catch {
      // ignore
    }
  }, [dreamUuid, id, imageUrl, isLoopFrame, updateReferenceFrame]);

  return { src, onError: dreamUuid ? refresh : undefined };
}
