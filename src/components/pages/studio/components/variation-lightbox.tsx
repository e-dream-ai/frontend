import React, { useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { FlowTransition } from "@/types/flow.types";
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

interface VariationLightboxProps {
  transition: FlowTransition;
  transitionIndex: number;
  effectivePrompt: string;
  /** URL of the current transition's video (if completed) */
  videoUrl?: string;
  onSelectVariation: (transitionIndex: number, variationId: string) => void;
  onRegenerate?: (transitionIndex: number) => void;
  onGenerateMore?: (transitionIndex: number) => void;
  onClose: () => void;
}

export const VariationLightbox: React.FC<VariationLightboxProps> = ({
  transition,
  transitionIndex,
  effectivePrompt,
  videoUrl,
  onSelectVariation,
  onRegenerate,
  onGenerateMore,
  onClose,
}) => {
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
              onGenerateMore={
                onGenerateMore
                  ? () => onGenerateMore(transitionIndex)
                  : undefined
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
          {onGenerateMore && (
            <LightboxButton onClick={() => onGenerateMore(transitionIndex)}>
              + Generate Variations
            </LightboxButton>
          )}
        </LightboxActions>
      </LightboxContent>
    </LightboxOverlay>,
    document.body,
  );
};
