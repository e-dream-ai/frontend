import React from "react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import styled, { keyframes } from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";
import type { ProjectSyncStatus } from "../hooks/useEditorProjectSync";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Wrapper = styled.span<{ $tone: "muted" | "error" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${(p) => (p.$tone === "error" ? FLOW.error : FLOW.textMuted)};
  white-space: nowrap;
`;

const Spinner = styled.span`
  display: flex;
  animation: ${spin} 0.9s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 2.4s;
  }
`;

type Props = {
  status: ProjectSyncStatus;
};

export const SaveStatus: React.FC<Props> = ({ status }) => {
  if (status === "idle") return null;

  if (status === "loading" || status === "saving") {
    return (
      <Wrapper $tone="muted" role="status">
        <Spinner>
          <Loader2 size={12} strokeWidth={2.4} />
        </Spinner>
        {status === "loading" ? "Loading" : "Saving"}
      </Wrapper>
    );
  }

  if (status === "error") {
    return (
      <Wrapper $tone="error" role="status">
        <AlertTriangle size={12} strokeWidth={2.4} />
        Not saved
      </Wrapper>
    );
  }

  return (
    <Wrapper $tone="muted" role="status">
      <Check size={12} strokeWidth={2.4} />
      Saved
    </Wrapper>
  );
};
