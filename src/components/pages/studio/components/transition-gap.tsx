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

  // Idle, no config — just the connecting line.
  if (status === "idle" && !configured) {
    return (
      <GapContainer $expanded={false} onClick={onClick}>
        <GapLine $configured={false} $failed={false} />
      </GapContainer>
    );
  }

  // Idle but configured — solid line + duration pill.
  if (status === "idle" && configured) {
    return (
      <GapContainer $expanded={false} onClick={onClick}>
        <GapLine $configured $failed={false} />
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
