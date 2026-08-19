import { Check, Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import type { FlowTransition } from "@/types/flow.types";
import {
  GapContainer,
  GapLine,
  StatusNode,
  ProgressRing,
  GapStatusLabel,
  DurationLabel,
} from "./transition-gap.styled";

interface TransitionGapProps {
  transition: FlowTransition;
  effectiveDuration: number;
  /** Joins two images of different shapes — cannot be generated. */
  mismatched?: boolean;
  /** Explains the mismatch, e.g. "1280x720 to 720x1280". */
  mismatchDetail?: string;
  onClick: () => void;
}

function hasOverrides(t: FlowTransition): boolean {
  return !!(
    t.presetOverride ||
    t.promptOverride ||
    t.negativePromptOverride ||
    t.durationOverride !== undefined ||
    t.modelOverride ||
    t.loraOverride ||
    t.numInferenceStepsOverride !== undefined ||
    t.guidanceOverride !== undefined
  );
}

export function TransitionGapEnhanced({
  transition,
  effectiveDuration,
  mismatched = false,
  mismatchDetail,
  onClick,
}: TransitionGapProps) {
  const { status, progress } = transition;
  const configured = hasOverrides(transition);

  // Aspect-ratio mismatch outranks the other idle states: it's the reason this
  // transition will be skipped by Generate All, so it has to be visible before
  // the user presses it. Live statuses below still win, so a transition already
  // rendering or rendered keeps reporting its real progress.
  if (mismatched && (status === "idle" || status === "failed")) {
    const title = mismatchDetail
      ? `Aspect ratio mismatch: ${mismatchDetail}. This transition will be skipped by Generate All.`
      : "Aspect ratio mismatch. This transition will be skipped by Generate All.";
    return (
      <GapContainer $expanded onClick={onClick} title={title}>
        <GapLine $configured={configured} $failed={false} $mismatched />
        <GapStatusLabel $status="failed">mismatch</GapStatusLabel>
      </GapContainer>
    );
  }

  // Idle, no config — just the connecting line.
  if (status === "idle" && !configured) {
    return (
      <GapContainer $expanded={false} onClick={onClick}>
        <GapLine $configured={false} $failed={false} $mismatched={false} />
      </GapContainer>
    );
  }

  // Idle but configured — solid line + duration pill.
  if (status === "idle" && configured) {
    return (
      <GapContainer $expanded={false} onClick={onClick}>
        <GapLine $configured $failed={false} $mismatched={false} />
        <DurationLabel>{effectiveDuration}s</DurationLabel>
      </GapContainer>
    );
  }

  // Queued — soft pulsing dot.
  if (status === "queue") {
    return (
      <GapContainer $expanded onClick={onClick}>
        <StatusNode $variant="queued" />
        <GapStatusLabel $status="queued">queued</GapStatusLabel>
      </GapContainer>
    );
  }

  // Processing — spinning loader inside a node, with progress ring.
  if (status === "processing") {
    const pct = Math.max(0, Math.min(100, progress ?? 0));
    return (
      <GapContainer $expanded onClick={onClick}>
        <StatusNode $variant="processing">
          {pct > 0 && <ProgressRing $percent={pct} />}
          <Loader2 size={14} strokeWidth={2.4} />
        </StatusNode>
        <GapStatusLabel $status="processing">
          {pct > 0 ? `${Math.round(pct)}%` : "rendering"}
        </GapStatusLabel>
      </GapContainer>
    );
  }

  // Success — filled gold disc with a check, soft halo, duration below.
  if (status === "processed") {
    return (
      <GapContainer $expanded onClick={onClick}>
        <StatusNode $variant="processed">
          <Check size={14} strokeWidth={3} />
        </StatusNode>
        <DurationLabel>{effectiveDuration}s</DurationLabel>
      </GapContainer>
    );
  }

  // Failed — red ring with warning icon. Whole node is "click to retry".
  return (
    <GapContainer
      $expanded
      onClick={onClick}
      title="Click to retry"
      role="button"
      tabIndex={0}
    >
      <StatusNode $variant="failed">
        <AlertTriangle size={13} strokeWidth={2.4} />
      </StatusNode>
      <GapStatusLabel $status="failed">
        <RotateCcw size={9} strokeWidth={2.4} />
        retry
      </GapStatusLabel>
    </GapContainer>
  );
}
