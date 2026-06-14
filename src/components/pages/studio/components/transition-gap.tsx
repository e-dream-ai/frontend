import { Check, Loader2, AlertTriangle, RotateCcw, Layers } from "lucide-react";
import type { FlowTransition } from "@/types/flow.types";
import {
  effectiveTransitionStatus,
  aggregateVariationProgress,
} from "../utils/variation-status";
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
  onClick,
}: TransitionGapProps) {
  const configured = hasOverrides(transition);
  // Derive the display status from the transition's own status OR, for a
  // multi-variant transition that stays "idle" until one is picked, from the
  // aggregate state of its variation candidates. Without this an idle
  // transition with generating/ready variations would render as a blank line.
  const status = effectiveTransitionStatus(transition);
  const progress =
    transition.variations && transition.variations.length > 0
      ? aggregateVariationProgress(transition.variations)
      : transition.progress;
  const variationCount = transition.variations?.length ?? 0;
  const readyCount =
    transition.variations?.filter((v) => v.status === "processed").length ?? 0;

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

  // Variations finished, none selected yet — invite the user to review & pick.
  if (status === "review") {
    return (
      <GapContainer $expanded onClick={onClick} title="Review variations">
        <StatusNode $variant="processed">
          <Layers size={13} strokeWidth={2.6} />
        </StatusNode>
        <GapStatusLabel $status="processed">
          {readyCount}/{variationCount} pick
        </GapStatusLabel>
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
