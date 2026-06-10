import React, { useCallback } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import type { FlowTransition } from "@/types/flow.types";
import type { Dream } from "@/types/dream.types";
import type { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";
import { DREAM_QUERY_KEY } from "@/api/dream/query/useDream";
import { VariationGrid } from "./variation-grid";
import { PromptExpansionBadge } from "./prompt-expansion-badge";
import {
  LightboxOverlay,
  LightboxContent,
  LightboxHeader,
  LightboxTitle,
  CloseButton,
  CurrentResult,
  SectionLabel,
  LightboxActions,
  LightboxButton,
} from "./variation-lightbox.styled";

async function fetchDream(uuid: string): Promise<Dream | undefined> {
  const res = await axiosClient.get<ApiResponse<{ dream: Dream }>>(
    `/v1/dream/${uuid}`,
    { headers: getRequestHeaders({ contentType: ContentType.json }) },
  );
  return res.data?.data?.dream;
}

interface VariationLightboxProps {
  transition: FlowTransition;
  transitionIndex: number;
  effectivePrompt: string;
  onSelectVariation: (transitionIndex: number, variationId: string) => void;
  onRegenerate?: (transitionIndex: number) => void;
  onClose: () => void;
}

export const VariationLightbox: React.FC<VariationLightboxProps> = ({
  transition,
  transitionIndex,
  effectivePrompt,
  onSelectVariation,
  onRegenerate,
  onClose,
}) => {
  // Fetch the dream to get the video URL — same pattern as FlowPreview.
  // This avoids constructing URLs from dreamUuid which breaks across environments.
  const { data: dream } = useQuery({
    queryKey: [DREAM_QUERY_KEY, transition.dreamUuid],
    queryFn: () => fetchDream(transition.dreamUuid!),
    enabled: !!transition.dreamUuid && transition.status === "processed",
    staleTime: Infinity,
  });

  const videoUrl = dream?.video || dream?.original_video || dream?.thumbnail;

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const hasVariations =
    transition.variations && transition.variations.length > 0;

  return createPortal(
    <LightboxOverlay onClick={handleOverlayClick}>
      <LightboxContent onClick={(e) => e.stopPropagation()}>
        <LightboxHeader>
          <LightboxTitle>
            Transition {transitionIndex + 1}{" "}
            <PromptExpansionBadge prompt={effectivePrompt} />
          </LightboxTitle>
          <CloseButton onClick={onClose}>
            <X size={14} />
          </CloseButton>
        </LightboxHeader>

        {videoUrl && transition.status === "processed" && (
          <>
            <SectionLabel>Current Result</SectionLabel>
            <CurrentResult>
              <video src={videoUrl} autoPlay loop muted playsInline />
            </CurrentResult>
          </>
        )}

        {hasVariations && (
          <>
            <SectionLabel>Variations</SectionLabel>
            <VariationGrid
              variations={transition.variations!}
              activeVariationId={transition.activeVariationId}
              onSelect={(variationId) =>
                onSelectVariation(transitionIndex, variationId)
              }
              onClose={() => {
                /* grid close is a no-op inside lightbox — use the X button */
              }}
            />
          </>
        )}

        <LightboxActions>
          {onRegenerate && transition.status === "processed" && (
            <LightboxButton
              $primary
              onClick={() => onRegenerate(transitionIndex)}
            >
              Regenerate (new seed)
            </LightboxButton>
          )}
        </LightboxActions>
      </LightboxContent>
    </LightboxOverlay>,
    document.body,
  );
};
