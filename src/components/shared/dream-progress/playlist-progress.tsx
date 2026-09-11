import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PlaylistProgress as PlaylistProgressData } from "@/types/job-progress.types";
import {
  PlaylistSummary,
  ProgressLabel,
  ProgressMeter,
  PlaylistProgressOverlayContainer,
} from "./dream-progress.styled";

const COMPLETION_VISIBLE_MS = 10_000;

export function PlaylistProgressOverlay({
  progress,
}: {
  progress?: PlaylistProgressData;
}) {
  if (!progress?.remaining) return null;

  return (
    <PlaylistProgressOverlayContainer>
      <PlaylistProgress progress={progress} />
    </PlaylistProgressOverlayContainer>
  );
}

export function PlaylistProgress({
  progress,
}: {
  progress?: PlaylistProgressData;
}) {
  const { t } = useTranslation();
  const remaining = progress?.remaining ?? 0;
  const [previousRemaining, setPreviousRemaining] = useState(remaining);
  const [justCompleted, setJustCompleted] = useState(false);

  if (remaining !== previousRemaining) {
    setPreviousRemaining(remaining);
    setJustCompleted(remaining === 0 && previousRemaining > 0);
  }

  useEffect(() => {
    if (!justCompleted) return;

    const timer = setTimeout(
      () => setJustCompleted(false),
      COMPLETION_VISIBLE_MS,
    );
    return () => clearTimeout(timer);
  }, [justCompleted]);

  if (!progress?.total) return null;
  if (remaining === 0 && !justCompleted) return null;

  const percent = Math.round((progress.completed / progress.total) * 100);
  const label = t("components.dream_progress.completed_count", {
    completed: progress.completed,
    total: progress.total,
  });
  const counts = [
    ["in_progress", progress.inProgress],
    ["queued", progress.queued],
    ["failed", progress.failed],
    ["idle", progress.idle],
  ] as const;

  return (
    <PlaylistSummary aria-label={t("components.dream_progress.playlist")}>
      <ProgressLabel>
        <strong>{label}</strong>
        <span>
          {t("components.dream_progress.remaining", {
            count: progress.remaining,
          })}
        </span>
      </ProgressLabel>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div aria-hidden="true">
          <ProgressMeter
            completed={percent}
            height="8px"
            borderRadius="4px"
            isLabelVisible={false}
          />
        </div>
      </div>
      <span>
        {counts
          .filter(([, count]) => count > 0)
          .map(([status, count]) =>
            t(`components.dream_progress.count_${status}`, { count }),
          )
          .join(" · ")}
      </span>
    </PlaylistSummary>
  );
}
