import React from "react";
import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";
import {
  countExpansions,
  countRawExpansions,
  MAX_EXPANSIONS,
} from "../utils/expand-prompt";

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  background: ${FLOW.accentDim};
  color: ${FLOW.accent};
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
`;

interface PromptExpansionBadgeProps {
  prompt: string;
}

export const PromptExpansionBadge: React.FC<PromptExpansionBadgeProps> = ({
  prompt,
}) => {
  const count = countExpansions(prompt);
  if (count <= 1) return null;
  const raw = countRawExpansions(prompt);
  // Surface the cap so the user knows combinations were dropped (and how many),
  // rather than silently generating only the first MAX_EXPANSIONS.
  if (raw > MAX_EXPANSIONS) {
    return (
      <Badge title={`Capped at ${MAX_EXPANSIONS} of ${raw} combinations`}>
        {MAX_EXPANSIONS} of {raw} (max {MAX_EXPANSIONS})
      </Badge>
    );
  }
  return <Badge>{count} variants</Badge>;
};
