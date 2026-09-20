import React from "react";
import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonCards,
  SkeletonFrame,
  SkeletonRow,
} from "./studio-skeleton.styled";

const CARD_COUNT = 3;

export const StudioSkeleton: React.FC = () => (
  <SkeletonFrame role="status" aria-label="Loading playlist">
    <SkeletonBlock $height={14} $width="140px" />
    <SkeletonCards>
      {Array.from({ length: CARD_COUNT }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </SkeletonCards>
    <SkeletonRow>
      <SkeletonBlock $height={36} $width="180px" />
      <SkeletonBlock $height={36} $width="180px" />
      <SkeletonBlock $height={36} $width="120px" />
    </SkeletonRow>
    <SkeletonBlock $height={200} />
  </SkeletonFrame>
);
