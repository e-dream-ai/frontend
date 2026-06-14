import React from "react";
import { Check } from "lucide-react";
import type { VariationCandidate } from "@/types/flow.types";
import { isVideoUrl } from "../utils/variation-status";
import {
  GridContainer,
  Grid,
  GridCell,
  GridCellImg,
  GridCellVideo,
  QueuedOverlay,
  ProcessingOverlay,
  FailedOverlay,
  ActiveBadge,
  GridActions,
  GridActionButton,
} from "./variation-grid.styled";

interface VariationGridProps {
  variations: VariationCandidate[];
  activeVariationId?: string;
  onSelect: (variationId: string) => void;
  onGenerateMore?: () => void;
  onClose: () => void;
}

function gridColumns(count: number): number {
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  return 4;
}

export const VariationGrid: React.FC<VariationGridProps> = ({
  variations,
  activeVariationId,
  onSelect,
  onGenerateMore,
  onClose,
}) => {
  if (variations.length === 0) return null;

  return (
    <GridContainer>
      <Grid $columns={gridColumns(variations.length)}>
        {variations.map((v) => (
          <GridCell
            key={v.id}
            $active={v.id === activeVariationId}
            $status={v.status}
            onClick={() => {
              if (v.status === "processed") onSelect(v.id);
            }}
          >
            {v.status === "processed" &&
              v.imageUrl &&
              (isVideoUrl(v.imageUrl) ? (
                <GridCellVideo
                  src={v.imageUrl}
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              ) : (
                <GridCellImg src={v.imageUrl} alt={v.prompt || "variation"} />
              ))}
            {v.status === "queue" && <QueuedOverlay>Queued</QueuedOverlay>}
            {v.status === "processing" && (
              <ProcessingOverlay>
                {v.progress != null ? `${v.progress}%` : "..."}
              </ProcessingOverlay>
            )}
            {v.status === "failed" && <FailedOverlay>Failed</FailedOverlay>}
            {v.id === activeVariationId && v.status === "processed" && (
              <ActiveBadge>
                <Check size={10} />
              </ActiveBadge>
            )}
          </GridCell>
        ))}
      </Grid>
      <GridActions>
        {onGenerateMore && (
          <GridActionButton onClick={onGenerateMore}>+ More</GridActionButton>
        )}
        <GridActionButton onClick={onClose}>Close</GridActionButton>
      </GridActions>
    </GridContainer>
  );
};
