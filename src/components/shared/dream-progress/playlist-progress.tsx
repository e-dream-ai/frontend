import { useTranslation } from "react-i18next";
import { usePlaylist } from "@/api/playlist/query/usePlaylist";
import type { PlaylistProgress as PlaylistProgressData } from "@/types/job-progress.types";
import {
  PlaylistSummary,
  ProgressLabel,
  ProgressMeter,
  PlaylistProgressOverlayContainer,
} from "./dream-progress.styled";

export function PlaylistProgressOverlay({ uuid }: { uuid: string }) {
  const { data } = usePlaylist(uuid);
  const progress = data?.data?.playlist?.progress;
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
  if (!progress?.total) return null;
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
