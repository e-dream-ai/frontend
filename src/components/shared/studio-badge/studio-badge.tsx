import React from "react";
import { STUDIO_MODE_LABELS } from "@/components/pages/studio/constants/studio-modes";
import type { StudioMode } from "@/types/flow.types";
import { Badge } from "./studio-badge.styled";

type Props = {
  mode: StudioMode;
  title?: string;
};

export const StudioBadge: React.FC<Props> = ({ mode, title }) => (
  <Badge $mode={mode} title={title ?? `Made with ${STUDIO_MODE_LABELS[mode]}`}>
    {STUDIO_MODE_LABELS[mode]}
  </Badge>
);
