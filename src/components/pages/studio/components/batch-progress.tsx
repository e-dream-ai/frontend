import { useMemo } from "react";
import type { StudioJob } from "@/types/studio.types";
import {
  ProgressBar,
  ProgressFill,
  ProgressInfo,
  ProgressTrack,
  TimeEstimate,
} from "./generate-tab.styled";

const summarize = (jobs: readonly StudioJob[]) => {
  let done = 0;
  let failed = 0;
  let timedCount = 0;
  let timedMs = 0;
  for (const job of jobs) {
    if (job.status === "processed") done++;
    if (job.status === "failed") failed++;
    if (job.startedAt && job.completedAt) {
      timedCount++;
      timedMs += job.completedAt - job.startedAt;
    }
  }
  const remaining = jobs.length - done - failed;
  const minutes =
    timedCount > 0 && remaining > 0
      ? Math.ceil(((timedMs / timedCount) * remaining) / 60_000)
      : undefined;
  return {
    done,
    percent: Math.round((done / jobs.length) * 100),
    estimate:
      minutes === undefined
        ? null
        : minutes <= 1
          ? "~1 min remaining"
          : `~${minutes} min remaining`,
  };
};

export function BatchProgress({ jobs }: { jobs: readonly StudioJob[] }) {
  const summary = useMemo(
    () => (jobs.length > 0 ? summarize(jobs) : null),
    [jobs],
  );
  if (!summary) return null;

  return (
    <ProgressBar>
      <ProgressInfo>
        <span>
          {summary.done} of {jobs.length} complete
        </span>
        <span>
          {summary.estimate && <TimeEstimate>{summary.estimate}</TimeEstimate>}
          {summary.percent}%
        </span>
      </ProgressInfo>
      <ProgressTrack>
        <ProgressFill $percent={summary.percent} />
      </ProgressTrack>
    </ProgressBar>
  );
}
