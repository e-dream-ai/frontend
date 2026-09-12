import { useTranslation } from "react-i18next";
import { useDreamProgress } from "@/hooks/useDreamProgress";
import type { DreamJobProgress } from "@/types/job-progress.types";
import {
  isActiveProgress,
  type DreamProgressSource,
} from "@/utils/job-progress.util";
import { formatEta } from "@/utils/video.utils";
import {
  IndeterminateTrack,
  ProgressContent,
  ProgressLabel,
  ProgressOverlay,
  ProgressStage,
  ProgressPercent,
  ProgressEta,
  ProgressMeter,
} from "./dream-progress.styled";

export function DreamProgress({ progress }: { progress?: DreamJobProgress }) {
  const { t } = useTranslation();
  if (!progress || !isActiveProgress(progress)) return null;

  const label = t(`components.dream_progress.${progress.stage}`);
  const percent =
    progress.progress == null ? null : Math.round(progress.progress);
  const eta = progress.countdown_ms;

  return (
    <ProgressContent>
      <ProgressLabel>
        <ProgressStage>{label}</ProgressStage>
        {percent !== null && <ProgressPercent>{percent}%</ProgressPercent>}
      </ProgressLabel>
      {percent === null ? (
        <IndeterminateTrack role="progressbar" aria-label={label}>
          <span />
        </IndeterminateTrack>
      ) : (
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
              height="6px"
              borderRadius="4px"
              isLabelVisible={false}
            />
          </div>
        </div>
      )}
      {eta != null && eta > 0 && (
        <ProgressEta>
          {t("components.dream_progress.eta", {
            time: formatEta(Math.ceil(eta / 1000)),
          })}
        </ProgressEta>
      )}
    </ProgressContent>
  );
}

export function DreamCardProgress({ dream }: { dream: DreamProgressSource }) {
  const progress = useDreamProgress(dream);
  return <DreamProgress progress={progress} />;
}

export function DreamProgressOverlay({
  dream,
}: {
  dream: DreamProgressSource;
}) {
  const progress = useDreamProgress(dream);
  if (!isActiveProgress(progress)) return null;
  return (
    <ProgressOverlay>
      <DreamProgress progress={progress} />
    </ProgressOverlay>
  );
}
