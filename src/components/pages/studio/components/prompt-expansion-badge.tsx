import React from "react";
import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";
import { countExpansions } from "../utils/expand-prompt";

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
  return <Badge>{count} variants</Badge>;
};
