import type { FlowTransition } from "@/types/flow.types";
import { FLOW } from "@/constants/flow-theme.constants";
import {
  GapContainer,
  GapLine,
  GapThumbnail,
  GapStatusLabel,
  GapProgressBar,
  GapProgressFill,
  DurationLabel,
  GapIcon,
} from "./transition-gap.styled";

interface TransitionGapProps {
  transition: FlowTransition;
  effectiveDuration: number;
  onClick: () => void;
}

function hasOverrides(t: FlowTransition): boolean {
  return !!(
    t.presetOverride ||
    t.promptOverride ||
    t.durationOverride !== undefined ||
    t.modelOverride ||
    t.loraOverride
  );
}

export function TransitionGapEnhanced({
  transition,
  effectiveDuration,
  onClick,
}: TransitionGapProps) {
  const { status, progress } = transition;
  const configured = hasOverrides(transition);

  // Empty state
  if (status === "idle" && !configured) {
    return (
      <GapContainer $expanded={false} onClick={onClick}>
        <GapLine $configured={false} $failed={false} />
      </GapContainer>
    );
  }

  // Configured but not yet generated
  if (status === "idle" && configured) {
    return (
      <GapContainer $expanded={false} onClick={onClick}>
        <GapLine $configured $failed={false} />
        <DurationLabel>{effectiveDuration}s</DurationLabel>
      </GapContainer>
    );
  }

  // Queued
  if (status === "queue") {
    return (
      <GapContainer $expanded onClick={onClick}>
        <GapThumbnail $status="queue">
          <GapStatusLabel $status="queue">queued</GapStatusLabel>
        </GapThumbnail>
      </GapContainer>
    );
  }

  // Processing
  if (status === "processing") {
    return (
      <GapContainer $expanded onClick={onClick}>
        <GapThumbnail $status="processing">
          <GapStatusLabel $status="processing">{progress ?? 0}%</GapStatusLabel>
        </GapThumbnail>
        <GapProgressBar>
          <GapProgressFill $percent={progress ?? 0} />
        </GapProgressBar>
      </GapContainer>
    );
  }

  // Complete
  if (status === "processed") {
    return (
      <GapContainer $expanded onClick={onClick}>
        <GapThumbnail $status="processed">
          <GapIcon $color={FLOW.success}>&#x2713;</GapIcon>
        </GapThumbnail>
        <DurationLabel>{effectiveDuration}s</DurationLabel>
      </GapContainer>
    );
  }

  // Failed
  return (
    <GapContainer $expanded onClick={onClick}>
      <GapThumbnail $status="failed">
        <GapIcon $color="#ef4444">!</GapIcon>
      </GapThumbnail>
      <GapStatusLabel $status="failed">failed</GapStatusLabel>
    </GapContainer>
  );
}
