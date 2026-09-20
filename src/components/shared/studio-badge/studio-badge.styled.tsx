import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";
import { EDITOR_BADGE } from "@/constants/editor-badge.constants";
import type { StudioMode } from "@/types/flow.types";

export const Badge = styled.span<{ $mode: StudioMode }>`
  display: inline-flex;
  align-items: center;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 3px 7px;
  border-radius: 4px;
  background: ${(p) => EDITOR_BADGE[p.$mode] ?? FLOW.textDim};
  color: ${FLOW.bg};
  flex-shrink: 0;
  margin-right: 8px;
`;
