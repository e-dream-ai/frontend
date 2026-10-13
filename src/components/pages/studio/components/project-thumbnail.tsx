import React from "react";
import { Film } from "lucide-react";
import type { StudioMode } from "@/types/flow.types";
import { STUDIO_MODE_LABELS } from "../constants/studio-modes";
import {
  Thumb,
  ThumbBadge,
  ThumbFallback,
} from "../studio-projects.page.styled";

type Props = {
  src?: string | null;
  alt: string;
  mode: StudioMode;
};

export const ProjectThumbnail: React.FC<Props> = ({ src, alt, mode }) => (
  <Thumb>
    {src ? (
      <img src={src} alt={alt} loading="lazy" />
    ) : (
      <ThumbFallback>
        <Film size={20} />
      </ThumbFallback>
    )}
    <ThumbBadge $mode={mode}>{STUDIO_MODE_LABELS[mode] ?? mode}</ThumbBadge>
  </Thumb>
);
